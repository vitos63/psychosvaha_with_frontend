from cron.queue.tasks.base_task import BaseTask


class AddTherapistsToRequestTask(BaseTask):
    request_id: int

    @staticmethod
    def get_type() -> str:
        return "add_therapists_to_client_request"
