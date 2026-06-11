# Portfolio V1 SQL

These files prepare the first portfolio-tracker foundation for the existing VPS MySQL setup.

## Files

- `portfolio_v1_schema.sql`
  - creates `assets_master`
  - creates `user_portfolio_holdings`
  - creates `portfolio_price_cache`
- `portfolio_v1_seed_assets.sql`
  - seeds the first supported assets for V1

## Why this structure

- `assets_master` is the source of truth for which assets the app supports.
- `user_portfolio_holdings` stores what each user actually owns.
- `portfolio_price_cache` stores the latest fetched price and simple trend status for portfolio calculations.
- Existing `market_prices` can continue to serve dashboard-specific series/history where available.

## Suggested execution order on the VPS

```sql
SOURCE C:/inetpub/wwwroot/portofolio-faturachman/server/sql/portfolio_v1_schema.sql;
SOURCE C:/inetpub/wwwroot/portofolio-faturachman/server/sql/portfolio_v1_seed_assets.sql;
```

If `SOURCE` is inconvenient in the MySQL client on Windows, paste the files manually in this order:

1. `portfolio_v1_schema.sql`
2. `portfolio_v1_seed_assets.sql`

## Notes

- Indonesia stocks are intentionally marked as `manual` provider for V1 until a stable source is chosen.
- V1 does not require market-history charts.
- V1 charts should focus on user portfolio allocation and PnL, not historical candles.
