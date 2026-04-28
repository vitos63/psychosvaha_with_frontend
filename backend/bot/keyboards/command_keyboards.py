from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from enums.therapist_statuses import TherapistStatuses


class CommandKeyboardBuilder:
    def __init__(self, is_admin: bool,
                 has_client_request: bool,
                 therapist_status: str,
                 tg_id: int):
        self.is_admin = is_admin
        self.has_client_request = has_client_request
        self.therapist_status = therapist_status
        self.tg_id = tg_id

    def get_start_keyboard(self) -> InlineKeyboardMarkup:
        buttons = []
        buttons = self.__add_admin_button(buttons=buttons)
        buttons = self.__add_client_button(buttons=buttons)
        buttons = self.__add_therapist_button(buttons=buttons)
        return InlineKeyboardMarkup(inline_keyboard=buttons)

    def __add_admin_button(self, buttons: list) -> list:
        if self.is_admin:
            buttons.append([InlineKeyboardButton(text="Я администратор", callback_data="admin")])

        return buttons

    def __add_therapist_button(self, buttons: list) -> list:
        if self.therapist_status == TherapistStatuses.NO_QUESTIONARY.value:
            buttons.append([InlineKeyboardButton(text="Я специалист", web_app=WebAppInfo(url="https://psychosvaha.ru/form-therapist-first"))])

        elif self.therapist_status == TherapistStatuses.APPROVED.value:
            buttons.append([InlineKeyboardButton(text="Я специалист", web_app=WebAppInfo(url="https://psychosvaha.ru/form-therapist-second"))])

        elif self.therapist_status == TherapistStatuses.NOT_APPROVED.value:
            buttons.append([InlineKeyboardButton(text="Я специалист", web_app=WebAppInfo(url="https://psychosvaha.ru/form-success"))])

        elif self.therapist_status == TherapistStatuses.HAVE_QUESTIONARY.value:
            buttons.append([InlineKeyboardButton(text="Я специалист", web_app=WebAppInfo(url="https://psychosvaha.ru/therapist/profile"))])

        return buttons

    def __add_client_button(self, buttons: list) -> list:
        if not self.has_client_request:
            buttons.append([InlineKeyboardButton(text="Я ищу специалиста", web_app=WebAppInfo(url="https://psychosvaha.ru/form-client"))])

        else:
            buttons.append([InlineKeyboardButton(text="Я ищу специалиста", web_app=WebAppInfo(url="https://psychosvaha.ru/form-success"))])

        return buttons
