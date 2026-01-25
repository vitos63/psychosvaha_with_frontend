ALEMBIC = .venv/Scripts/alembic.exe -c alembic.ini
PYTHON = .venv/Scripts/python.exe

# Создание миграций
revision:
	$(ALEMBIC) revision --autogenerate -m "$(m)"

# Применить последнюю миграцию
upgrade:
	$(ALEMBIC) upgrade head

# Откатить на одну миграцию назад
downgrade:
	$(ALEMBIC) downgrade -1

# Посмотреть историю миграций
history:
	$(ALEMBIC) history --verbose

# Поднять локальное окружение
docker_compose_up:
	docker compose up -d

# Вырубить локальное окружение
docker_compose_down:
	docker compose down -v

# Запустить http сервер
run_http_server:
	$(PYTHON) -m uvicorn server.main:app --host 127.0.0.1 --port 8000

# Запустить обработчик задач
run_consumer:
	$(PYTHON) -m cron.queue.main