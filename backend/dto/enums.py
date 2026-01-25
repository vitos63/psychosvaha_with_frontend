from enum import Enum


class Sex(str, Enum):
    male = "Мужчина"
    female = "Женщина"


class Status(str, Enum):
    OPEN = "Открыта"
    PAUSE = "На паузе"
    HANDLE = "Ручной режим"
    CLOSE_SUCCESS = "Успешно закрыта"
    CLOSE_FAILED = "Закрыта с ошибкой"


class PsychoTherapistResponse(str, Enum):
    POSITIVE = "Ответил положительно"
    NEGATIVE = "Ответил отрицательно"
    WAITING = "Ожидаем ответа"


class Approved(str, Enum):
    APPROVE = 'Одобрен'
    DISAPPROVE = "Не одобрен"
    NOT_A_DEFINITION = 'Не определен'


class QueueStatus(str, Enum):
    READY = "ready"
    DONE = "done"
    ERROR = "error"
