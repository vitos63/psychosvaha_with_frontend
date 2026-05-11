#!/bin/sh

echo "Running migrations..."
alembic upgrade head

python ./cron/queue/main.py &
python -m bot.main &

exec uvicorn server.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips='*'