from cron.queue.tasks.base_task import BaseTask


class AddTagsToRequestTask(BaseTask):
    request_id: int

    @staticmethod
    def get_type() -> str:
        return "add_tags_to_client_request"
