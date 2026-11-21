#!/bin/bash
set -e

echo "🚀 Iniciando contenedores Docker (PostgreSQL y Redis)..."
docker start beautiful-health-postgres beautiful-health-redis

echo "⚡ Iniciando servidor Backend en Go (puerto 6060)..."
cd "$(dirname "$0")/../backend"
go run ./cmd/server/main.go
