# Makefile for common Docker Compose tasks
# Usage (POSIX): make up | down | start | stop | restart | logs | ps | build
# On Windows (PowerShell) it will prefer the existing scripts in scripts/*.ps1

SHELL := /bin/sh

COMPOSE_FILE := Docker/docker.yml
ENV_FILE := Docker/.env

ifdef OS
  IS_WINDOWS := 1
else
  IS_WINDOWS := 0
endif

POWER on_windows = $(shell powershell -NoProfile -Command "Write-Output '1'" 2>/dev/null || echo "0")

ifeq ($(POWER),1)
  DOCKER_UP := powershell -ExecutionPolicy ByPass -File "scripts/docker-up.ps1"
  DOCKER_DOWN := powershell -ExecutionPolicy ByPass -File "scripts/docker-down.ps1"
else
  DOCKER_UP := docker-compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) up -d --build
  DOCKER_DOWN := docker-compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) down
endif

.PHONY: up down start stop restart logs ps build help

up:
	@echo "Starting stack..."
	@$(DOCKER_UP)

down:
	@echo "Stopping and removing stack..."
	@$(DOCKER_DOWN)

start:
	@echo "Starting containers (no build)..."
	@docker-compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) up -d

stop:
	@echo "Stopping containers..."
	@docker-compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) stop

restart: stop start
	@echo "Restarted stack"

logs:
	@echo "Tailing dashboard_app logs (CTRL+C to stop)"
	@docker logs -f dashboard_app

ps:
	@docker ps --format "{{.Names}}\t{{.Status}}\t{{.Ports}}"

build:
	@echo "Building dashboard-app image"
	@docker-compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) build --no-cache dashboard-app

help:
	@echo "Available targets: up down start stop restart logs ps build"
