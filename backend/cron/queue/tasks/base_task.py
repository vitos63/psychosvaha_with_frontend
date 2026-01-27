from abc import ABC, abstractmethod

from pydantic import BaseModel, ConfigDict


class BaseTask(BaseModel, ABC):
    model_config = ConfigDict(extra="forbid")

    @staticmethod
    @abstractmethod
    def get_type() -> str:
        raise NotImplementedError

    @classmethod
    def get_processor_name(cls) -> str:
        return f"{cls.get_type()}_processor"

    def to_dict(self) -> dict:
        return self.model_dump(mode="json", exclude={"start_at"})
