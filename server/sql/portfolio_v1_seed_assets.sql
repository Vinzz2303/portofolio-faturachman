INSERT INTO assets_master
  (symbol, name, asset_type, region, provider, provider_symbol, quote_currency, display_order)
VALUES
  ('AAPL', 'Apple Inc.', 'stock', 'US', 'twelvedata', 'AAPL', 'USD', 10),
  ('MSFT', 'Microsoft Corp.', 'stock', 'US', 'twelvedata', 'MSFT', 'USD', 20),
  ('GOOGL', 'Alphabet Inc. Class A', 'stock', 'US', 'twelvedata', 'GOOGL', 'USD', 30),
  ('AMZN', 'Amazon.com Inc.', 'stock', 'US', 'twelvedata', 'AMZN', 'USD', 40),
  ('NVDA', 'NVIDIA Corp.', 'stock', 'US', 'twelvedata', 'NVDA', 'USD', 50),

  ('BBCA', 'Bank Central Asia Tbk.', 'stock', 'ID', 'manual', 'BBCA', 'IDR', 110),
  ('BBRI', 'Bank Rakyat Indonesia Tbk.', 'stock', 'ID', 'manual', 'BBRI', 'IDR', 120),
  ('BMRI', 'Bank Mandiri Tbk.', 'stock', 'ID', 'manual', 'BMRI', 'IDR', 130),
  ('TLKM', 'Telkom Indonesia Tbk.', 'stock', 'ID', 'manual', 'TLKM', 'IDR', 140),
  ('ASII', 'Astra International Tbk.', 'stock', 'ID', 'manual', 'ASII', 'IDR', 150),
  ('ANTM', 'Aneka Tambang Tbk.', 'stock', 'ID', 'manual', 'ANTM', 'IDR', 160),

  ('SPX', 'S&P 500', 'index', 'US', 'twelvedata', 'SPY', 'USD', 210),
  ('DJIA', 'Dow Jones Industrial Average', 'index', 'US', 'twelvedata', 'DIA', 'USD', 220),
  ('NDX', 'Nasdaq-100', 'index', 'US', 'twelvedata', 'QQQ', 'USD', 230),

  ('BTC', 'Bitcoin', 'crypto', 'GLOBAL', 'coingecko', 'bitcoin', 'USD', 310),
  ('ETH', 'Ethereum', 'crypto', 'GLOBAL', 'coingecko', 'ethereum', 'USD', 320),
  ('BNB', 'BNB', 'crypto', 'GLOBAL', 'coingecko', 'binancecoin', 'USD', 330),
  ('SOL', 'Solana', 'crypto', 'GLOBAL', 'coingecko', 'solana', 'USD', 340),

  ('XAU', 'Gold', 'commodity', 'GLOBAL', 'manual', 'XAU', 'IDR', 410),
  ('XAG', 'Silver', 'commodity', 'GLOBAL', 'manual', 'XAG', 'USD', 420)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  asset_type = VALUES(asset_type),
  region = VALUES(region),
  provider = VALUES(provider),
  provider_symbol = VALUES(provider_symbol),
  quote_currency = VALUES(quote_currency),
  display_order = VALUES(display_order),
  is_active = 1,
  updated_at = CURRENT_TIMESTAMP;
