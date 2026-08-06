import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from loguru import logger

ROOT_DIR = Path(__file__).parent

ok = load_dotenv(ROOT_DIR / ".env")
assert ok, ".env file not found"

logger.remove()
logger.add(sink=sys.stdout, level=os.getenv("LOG_LEVEL", "INFO").upper())

DB_MIGRATIONS_URL = os.environ["DB_MIGRATIONS_URL"]
DB_URL = os.environ["DB_URL"]

CONSUMER_BATCH_SIZE = int(os.environ["CONSUMER_BATCH_SIZE"])
CONSUMER_SLEEP_SECONDS = float(os.environ["CONSUMER_SLEEP_SECONDS"])
CONSUMER_SHUTDOWN_SECONDS = float(os.environ["CONSUMER_SHUTDOWN_SECONDS"])

REGULAR_TASKS_SLEEP_TIME = int(os.environ("REGULAR_TASKS_SLEEP_TIME"), 5*60)

BOT_TOKEN = os.environ['BOT_TOKEN']

SECRET_KEY = os.environ["SECRET_KEY"]

ADMIN_TG_CHAT_ID = int(os.environ["ADMIN_TG_CHAT_ID"])
