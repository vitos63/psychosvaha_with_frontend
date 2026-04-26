from __future__ import annotations

from typing import Optional

START_MESSAGE_IDS: dict[tuple[int, int], int] = {}


def set_start_message_id(chat_id: int, user_id: int, message_id: int) -> None:
    START_MESSAGE_IDS[(chat_id, user_id)] = message_id


def pop_start_message_id(chat_id: int, user_id: int) -> Optional[int]:
    return START_MESSAGE_IDS.pop((chat_id, user_id), None)


def pop_start_message_id_by_user(user_id: int) -> tuple[Optional[int], Optional[int]]:
    for (chat_id, stored_user_id), message_id in list(START_MESSAGE_IDS.items()):
        if stored_user_id == user_id:
            START_MESSAGE_IDS.pop((chat_id, stored_user_id), None)
            return chat_id, message_id
    return None, None
