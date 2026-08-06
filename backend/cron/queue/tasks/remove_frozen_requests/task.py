from cron.queue.tasks.base_task import BaseTask


class RemoveFrozenRequestsTask(BaseTask):

    @staticmethod
    def get_type() -> str:
        return "remove_frozen_requests"
