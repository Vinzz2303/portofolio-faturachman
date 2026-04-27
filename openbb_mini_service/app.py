from __future__ import annotations

import os
from datetime import date, timedelta
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

try:
    from openbb import obb
except Exception as exc:  # pragma: no cover - startup guard
    obb = None
    OPENBB_IMPORT_ERROR = str(exc)
else:
    OPENBB_IMPORT_ERROR = None


class SemanticMeta(BaseModel):
    provider: str | None = None
    ts: int
    symbol: str | None = None
    note: str | None = None


class VolatilityResponse(BaseModel):
    volatilityTrend: str
    meta: SemanticMeta


class MacroPressureResponse(BaseModel):
    macroPressure: str
    marketStress: str
    meta: SemanticMeta


app = FastAPI(
    title="Ting AI OpenBB Mini Service",
    version="0.1.0",
    description="Small semantic OpenBB service for Ting AI trust pipeline."
)


def _today_ts() -> int:
    return int(__import__("time").time())


def _require_openbb() -> None:
    if obb is None:
        raise HTTPException(status_code=503, detail=f"OpenBB import failed: {OPENBB_IMPORT_ERROR}")


def _to_dict(item: Any) -> dict[str, Any]:
    if item is None:
        return {}
    if isinstance(item, dict):
        return item
    if hasattr(item, "model_dump"):
        return item.model_dump()
    if hasattr(item, "dict"):
        return item.dict()
    return {
        key: getattr(item, key)
        for key in dir(item)
        if not key.startswith("_") and not callable(getattr(item, key))
    }


def _extract_rows(result: Any) -> list[dict[str, Any]]:
    if result is None:
        return []

    payload = result
    if hasattr(result, "results"):
        payload = result.results
    elif isinstance(result, dict) and "results" in result:
        payload = result["results"]

    if payload is None:
        return []
    if isinstance(payload, list):
        return [_to_dict(item) for item in payload]
    return [_to_dict(payload)]


def _latest_numeric(rows: list[dict[str, Any]], field: str) -> tuple[float, float] | None:
    values: list[float] = []
    for row in rows:
        raw = row.get(field)
        if raw is None:
            continue
        try:
            values.append(float(raw))
        except (TypeError, ValueError):
            continue

    if len(values) < 2:
        return None

    return values[-2], values[-1]


def _get_historical_prices(symbol: str, provider: str, lookback_days: int) -> list[dict[str, Any]]:
    start_date = (date.today() - timedelta(days=lookback_days)).isoformat()
    result = obb.equity.price.historical(symbol=symbol, provider=provider, start_date=start_date)
    return _extract_rows(result)


def _get_fred_series(symbol: str, lookback_days: int, provider: str = "fred") -> list[dict[str, Any]]:
    start_date = (date.today() - timedelta(days=lookback_days)).isoformat()
    result = obb.economy.fred_series(symbol=symbol, provider=provider, start_date=start_date)
    return _extract_rows(result)


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "ok": obb is not None,
        "openbbImported": obb is not None,
        "note": OPENBB_IMPORT_ERROR
    }


@app.get("/api/v1/market/volatility", response_model=VolatilityResponse)
def market_volatility() -> VolatilityResponse:
    _require_openbb()

    symbol = os.getenv("OPENBB_VIX_SYMBOL", "^VIX")
    provider = os.getenv("OPENBB_VIX_PROVIDER", "yfinance")
    lookback_days = int(os.getenv("OPENBB_VOL_LOOKBACK_DAYS", "14"))

    rows = _get_historical_prices(symbol=symbol, provider=provider, lookback_days=lookback_days)
    latest = _latest_numeric(rows, "close")
    if not latest:
        raise HTTPException(status_code=502, detail="Unable to derive volatility trend from OpenBB response.")

    previous_close, latest_close = latest
    delta = latest_close - previous_close

    if delta > 0.5:
        trend = "rising"
    elif delta < -0.5:
        trend = "falling"
    else:
        trend = "stable"

    return VolatilityResponse(
        volatilityTrend=trend,
        meta=SemanticMeta(provider=provider, symbol=symbol, ts=_today_ts())
    )


@app.get("/api/v1/macro/pressure", response_model=MacroPressureResponse)
def macro_pressure() -> MacroPressureResponse:
    _require_openbb()

    provider = os.getenv("OPENBB_FRED_PROVIDER", "fred")
    stress_series = os.getenv("OPENBB_STRESS_SERIES", "STLFSI4")
    pressure_series = os.getenv("OPENBB_PRESSURE_SERIES", "NFCI")
    lookback_days = int(os.getenv("OPENBB_MACRO_LOOKBACK_DAYS", "60"))

    stress_rows = _get_fred_series(symbol=stress_series, lookback_days=lookback_days, provider=provider)
    pressure_rows = _get_fred_series(symbol=pressure_series, lookback_days=lookback_days, provider=provider)

    latest_stress = _latest_numeric(stress_rows, "value")
    latest_pressure = _latest_numeric(pressure_rows, "value")

    if not latest_stress or not latest_pressure:
        raise HTTPException(status_code=502, detail="Unable to derive macro pressure from OpenBB response.")

    previous_stress, current_stress = latest_stress
    previous_pressure, current_pressure = latest_pressure

    pressure_delta = current_pressure - previous_pressure

    if pressure_delta > 0.02:
        macro_pressure_value = "tightening"
    elif pressure_delta < -0.02:
        macro_pressure_value = "easing"
    else:
        macro_pressure_value = "neutral"

    market_stress_value = "elevated" if current_stress > 0 or current_pressure > 0 else "normal"

    return MacroPressureResponse(
        macroPressure=macro_pressure_value,
        marketStress=market_stress_value,
        meta=SemanticMeta(provider=provider, symbol=f"{stress_series},{pressure_series}", ts=_today_ts())
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host=os.getenv("OPENBB_SERVICE_HOST", "127.0.0.1"),
        port=int(os.getenv("OPENBB_SERVICE_PORT", "8000")),
        reload=False
    )
