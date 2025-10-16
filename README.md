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
