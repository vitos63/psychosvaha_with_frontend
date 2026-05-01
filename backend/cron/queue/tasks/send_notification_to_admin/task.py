from cron.queue.tasks.base_task import BaseTask


class SendNotificationTOAdminTask(BaseTask):

    @staticmethod
    def get_type() -> str:
        return "send_notification_to_admin"
