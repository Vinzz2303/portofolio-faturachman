CREATE TABLE IF NOT EXISTS assets_master (
  id INT AUTO_INCREMENT PRIMARY KEY,
  symbol VARCHAR(24) NOT NULL,
  name VARCHAR(120) NOT NULL,
  asset_type ENUM('stock', 'index', 'crypto', 'commodity') NOT NULL,
  region VARCHAR(32) NOT NULL DEFAULT 'GLOBAL',
  provider VARCHAR(32) DEFAULT NULL,
  provider_symbol VARCHAR(64) DEFAULT NULL,
  quote_currency VARCHAR(16) NOT NULL DEFAULT 'USD',
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_assets_master_symbol (symbol),
  KEY idx_assets_master_type_region (asset_type, region),
  KEY idx_assets_master_active_order (is_active, display_order)
);

CREATE TABLE IF NOT EXISTS user_portfolio_holdings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  asset_id INT NOT NULL,
  quantity DECIMAL(24,8) NOT NULL DEFAULT 0,
  entry_price DECIMAL(24,8) NOT NULL DEFAULT 0,
  invested_amount DECIMAL(24,8) NOT NULL DEFAULT 0,
  position_currency VARCHAR(16) NOT NULL DEFAULT 'USD',
  notes VARCHAR(255) DEFAULT NULL,
  opened_at DATE DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_portfolio_holdings_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_portfolio_holdings_asset
    FOREIGN KEY (asset_id) REFERENCES assets_master(id) ON DELETE RESTRICT,
  KEY idx_user_holdings_user_active (user_id, is_active),
  KEY idx_user_holdings_asset_active (asset_id, is_active)
);

CREATE TABLE IF NOT EXISTS portfolio_price_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT NOT NULL,
  latest_price DECIMAL(24,8) NOT NULL DEFAULT 0,
  price_change DECIMAL(24,8) DEFAULT NULL,
  price_change_pct DECIMAL(12,6) DEFAULT NULL,
  trend ENUM('up', 'down', 'flat') NOT NULL DEFAULT 'flat',
  source VARCHAR(64) DEFAULT NULL,
  fetched_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_portfolio_price_cache_asset
    FOREIGN KEY (asset_id) REFERENCES assets_master(id) ON DELETE CASCADE,
  UNIQUE KEY uq_portfolio_price_cache_asset (asset_id),
  KEY idx_portfolio_price_cache_trend (trend),
  KEY idx_portfolio_price_cache_fetched_at (fetched_at)
);
