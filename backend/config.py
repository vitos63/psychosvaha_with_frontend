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
