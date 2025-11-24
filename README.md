# Dashboard

## Helper scripts (PowerShell)

Two convenience scripts are provided in the `scripts/` folder to run Docker Compose with the correct compose file and env file on Windows/PowerShell.

- `scripts\docker-up.ps1` — start the stack
- `scripts\docker-down.ps1` — stop the stack

Basic usage (from the project root):

```powershell
.\scripts\docker-up.ps1
.\scripts\docker-down.ps1
```

Both scripts accept optional parameters:

-ComposeFile <path> — path to the compose file (default: `Docker/docker.yml`)
-EnvFile <path> — path to the .env file (default: `Docker/.env`)

Additional switches:

- `-Detach` (docker-up) — run `docker-compose up -d`
- `-RemoveVolumes` (docker-down) — run `docker-compose down --volumes`

Examples:

```powershell
# Start in the background using defaults
.\scripts\docker-up.ps1 -Detach

# Start using a custom compose and env
.\scripts\docker-up.ps1 -ComposeFile docker-compose.yml -EnvFile .env -Detach

# Stop and remove volumes
.\scripts\docker-down.ps1 -RemoveVolumes
```

These scripts simply wrap `docker-compose` and pass the selected flags. They print the actual command they run so you can copy/paste it for manual runs.

## Database (MySQL)

The compose stack runs MySQL and maps a host port to the container port. By default the host port is `3307` to avoid conflicts with a local MySQL instance. The port value is set in the `.env` files as `DB_HOST_PORT`.

To import the example schema provided in `scripts/db/init.sql` into the running MySQL container:

```powershell
# Copy SQL into the container and import using the mysql client (uses root password from .env)
docker cp scripts/db/init.sql dashboard_db_instance:/init.sql
docker exec -i dashboard_db_instance sh -c "mysql -u root -p\"$Env:MYSQL_ROOT_PASSWORD\" $Env:MYSQL_DATABASE < /init.sql"
```

Or, from the host, connect with a MySQL client:

```powershell
:mysql -h 127.0.0.1 -P $Env:DB_HOST_PORT -u root -p
```

If the `mysql` client isn't installed on your host, you can run it from a temporary container:

```powershell
docker run -it --rm mysql:8.0 mysql -h host.docker.internal -P $Env:DB_HOST_PORT -u root -p
```

Adminer (web UI)

An Adminer instance is available at http://localhost:8080. Use the following values to log in:

- System: MySQL
- Server: host.docker.internal (or 127.0.0.1)
- Username: dashboard_user (or root)
- Password: password (or the root password from `.env`)
- Database: dashboard_db

Adminer runs in the `adminer` container and is mapped to host port 8080 by compose.

## Running with Docker Compose

This repository includes a top-level `docker-compose.yml` that mirrors the configuration in `Docker/docker.yml` but is configured to load environment variables from the `Docker/.env` file and a root `.env` for convenience.

From the project root you can validate the compose file with:

```powershell
docker-compose config
```

To start the services:

```powershell
docker-compose up -d
```

If you prefer to use the `Docker/docker.yml` file directly from another working directory, pass it with -f and point to the env file explicitly:

```powershell
docker-compose -f Docker/docker.yml --env-file Docker/.env up -d
```

Notes:

- If you see warnings that variables are not set, ensure the correct `.env` is referenced or set environment variables in your shell.
- One warning about the `version` attribute being obsolete may appear; it's harmless but you can remove it from the top-level `docker-compose.yml` to silence the message.

# Dashboard
