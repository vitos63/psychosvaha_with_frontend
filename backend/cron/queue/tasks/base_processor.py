from abc import ABC, abstractmethod

from .base_task import BaseTask


class BaseProcessor(ABC):
    @abstractmethod
    async def process_task(self, task: BaseTask):
        raise NotImplementedError
