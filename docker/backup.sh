#!/bin/sh
# Backup automático PostgreSQL — ms-argos
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backup"
DB_HOST="${DB_HOST:-argos-postgres}"
DB_NAME="${DB_NAME:-ms_argos}"
DB_USER="${DB_USER:-u_bd_ms_argos}"
FILENAME="ms-argos-postgres_${DB_NAME}_${TIMESTAMP}.bkp"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Iniciando backup: $FILENAME"
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -F c -f "$BACKUP_DIR/$FILENAME"
echo "[$(date)] Backup concluído: $FILENAME"

# Remove backups com mais de 7 dias
find "$BACKUP_DIR" -name "ms-argos-postgres_*.bkp" -mtime +7 -delete
echo "[$(date)] Limpeza de backups antigos concluída."
