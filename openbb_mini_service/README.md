# Ting AI OpenBB Mini Service

Mini FastAPI service untuk self-host OpenBB sebagai sensor data ringan bagi Ting AI.

Tujuan:
- memberi endpoint kecil yang cocok langsung dengan `server/src/services/openbbAdapter.ts`
- menjaga OpenBB tetap sebagai `raw source`
- membiarkan Ting AI tetap menjadi `intelligence layer`

## Endpoint

- `GET /health`
- `GET /api/v1/market/volatility`
- `GET /api/v1/macro/pressure`

## Output

Service ini tidak mengirim tabel mentah ke Ting AI. Output sudah semantik:

- `volatilityTrend`
- `macroPressure`
- `marketStress`

## Setup Lokal / VPS

1. Masuk ke folder ini

```powershell
cd D:\IdeaJ\portofolio faturachman alkahfi\openbb_mini_service
```

2. Buat virtual environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

3. Install dependency

```powershell
pip install -r requirements.txt
```

4. Copy `.env.example` jadi `.env` lalu sesuaikan bila perlu

5. Jalankan service

```powershell
python app.py
```

Default service akan hidup di:

```text
http://127.0.0.1:8000
```

## Hubungkan ke Ting AI

Di backend Ting AI, set environment:

```text
OPENBB_API_URL=http://127.0.0.1:8000
OPENBB_TIMEOUT_MS=1800
OPENBB_CACHE_TTL_MS=60000
```

## Catatan

- Service ini sengaja kecil dan terkendali.
- Ia cocok untuk fase awal self-host OpenBB.
- Kalau OpenBB atau provider gagal, adapter Ting AI tetap fallback dan aplikasi tidak pecah.
