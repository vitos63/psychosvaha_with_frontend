from aiogram import Bot

from ..config import ADMIN_TG_CHAT_ID


class ProblemReportService:
    def __init__(self, bot: Bot):
        self._bot = bot

    async def send_report_to_admin(self, tg_username: str, problem_description: str):
        await self._bot.send_message(chat_id=ADMIN_TG_CHAT_ID, text=f"""📝 Новое обращение из приложения Психосваха:
                               tg_username: {tg_username},
                               {problem_description}
                               """)
