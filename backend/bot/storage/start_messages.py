from __future__ import annotations

import json
import logging

from redis.asyncio import Redis

logger = logging.getLogger(__name__)

redis = Redis(
    host="redis",
    port=6379,
    decode_responses=True,
)


async def set_start_message_id(chat_id: int, user_id: int, message_id: int) -> None:
    key = f"start_message:{user_id}"

    await redis.set(
        key,
        json.dumps(
            {
                "chat_id": chat_id,
                "message_id": message_id,
            },
            ensure_ascii=False,
        ),
    )


async def pop_start_message_id_by_user(user_id: int) -> tuple[int | None, int | None]:
    key = f"start_message:{user_id}"

    value = await redis.getdel(key)

    if value is None:
        return None, None

    try:
        data = json.loads(value)
    except json.JSONDecodeError:
        logger.exception("Invalid JSON in Redis for key=%s", key)
        return None, None

    chat_id = data.get("chat_id")
    message_id = data.get("message_id")

    if not isinstance(chat_id, int) or not isinstance(message_id, int):
        logger.warning("Invalid start message data in Redis for key=%s: %s", key, data)
        return None, None

    return chat_id, message_id