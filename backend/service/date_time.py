from datetime import datetime, timezone


class DateTimeService:
    def __init__(self, tz: timezone):
        self._tz = tz

    def get_current_time(self) -> datetime:
        return datetime.now(tz=self._tz)
