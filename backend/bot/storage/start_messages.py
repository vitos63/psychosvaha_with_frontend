from __future__ import annotations

import json
import logging
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any

logger = logging.getLogger(__name__)

_STORAGE_PATH = Path("/tmp/telegram_start_messages.json")


def _load_storage() -> dict[str, dict[str, int]]:
    if not _STORAGE_PATH.exists():
        return {}

    try:
        with _STORAGE_PATH.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except json.JSONDecodeError:
        logger.exception("Start messages storage JSON is corrupted: %s", _STORAGE_PATH)
        return {}
    except OSError:
        logger.exception("Failed to read start messages storage: %s", _STORAGE_PATH)
        return {}

    if not isinstance(data, dict):
        logger.warning("Unexpected start messages storage format, expected object: %s", _STORAGE_PATH)
        return {}

    normalized: dict[str, dict[str, int]] = {}
    for user_id, value in data.items():
        if not isinstance(user_id, str) or not isinstance(value, dict):
            continue

        chat_id = value.get("chat_id")
        message_id = value.get("message_id")

        if not isinstance(chat_id, int) or not isinstance(message_id, int):
            continue

        normalized[user_id] = {"chat_id": chat_id, "message_id": message_id}

    return normalized


def _atomic_write(data: dict[str, dict[str, int]]) -> None:
    _STORAGE_PATH.parent.mkdir(parents=True, exist_ok=True)

    temp_file: NamedTemporaryFile[Any] | None = None
    temp_path: Path | None = None
    try:
        temp_file = NamedTemporaryFile("w", encoding="utf-8", dir=_STORAGE_PATH.parent, delete=False)
        temp_path = Path(temp_file.name)
        with temp_file:
            json.dump(data, temp_file, ensure_ascii=False)
        temp_path.replace(_STORAGE_PATH)
    except OSError:
        logger.exception("Failed to persist start messages storage to %s", _STORAGE_PATH)
        if temp_path and temp_path.exists():
            temp_path.unlink(missing_ok=True)


def set_start_message_id(chat_id: int, user_id: int, message_id: int) -> None:
    storage = _load_storage()
    storage[str(user_id)] = {
        "chat_id": chat_id,
        "message_id": message_id,
    }
    _atomic_write(storage)


def pop_start_message_id_by_user(user_id: int) -> tuple[int | None, int | None]:
    storage = _load_storage()
    key = str(user_id)
    value = storage.pop(key, None)

    if value is None:
        return None, None

    _atomic_write(storage)
    return value["chat_id"], value["message_id"]
