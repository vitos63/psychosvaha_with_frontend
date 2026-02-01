import random
import uuid


class Multiplier:
    POSITIVE = 1
    NEGATIVE = -1
    RANDOM = "random"


def random_int(_from: int = 1, _to: int = 9999999, multiplier: Multiplier = Multiplier.POSITIVE) -> int:
    unique_number = uuid.uuid4().int & ((1 << 64) - 1)
    if multiplier == Multiplier.RANDOM:
        multiplier = random.choice([-1, 1])
    return (_from + (unique_number % (_to - _from + 1))) * multiplier


def random_string() -> str:
    return str(uuid.uuid4())
