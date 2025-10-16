-- Ensure the application user exists and has privileges
CREATE USER IF NOT EXISTS 'dashboard_user' @'%' IDENTIFIED BY 'password';

GRANT ALL PRIVILEGES ON dashboard_db.* TO 'dashboard_user' @'%';

FLUSH PRIVILEGES;