from sqladmin import ModelView
from fastapi import Request
from database.models import Admin


from database.models import (
    Tag,
    Therapist,
    ClientRequest,
    )


class BaseModelView(ModelView):
    page_size = 100
    page_size_options = [50, 100, 200, 500]


class TagAdmin(BaseModelView, model=Tag):
    name = "Тег"
    name_plural = "Теги"
    column_list = [
        Tag.title,
        Tag.regular_expression,
        Tag.value
    ]

    column_searchable_list = [
        Tag.title,
        Tag.regular_expression,
    ]

    column_sortable_list = [
        Tag.title,
    ]

    form_columns = [
        Tag.title,
        Tag.regular_expression,
        Tag.value
    ]

    form_args = {
        'title': {
            'label': 'Название тега',
            'validators': [],
            'description': 'Введите название тега'
        }
    }


class AdminAdmin(BaseModelView, model=Admin):
    name = "Администратор"
    name_plural = "Администраторы"

    column_list = [
        Admin.tg_id,
    ]

    column_details_list = [
        Admin.tg_id,
    ]


class TherapistsAdmin(BaseModelView, model=Therapist):
    name = "Психотерапевт"
    name_plural = "Психотерапевты"
    column_list = [
        Therapist.tg_id,
        Therapist.first_name,
        Therapist.last_name,
        Therapist.available_to_call,
        Therapist.status,
        "tags",
        "client_requests"
    ]

    column_searchable_list = [
        Therapist.first_name,
        Therapist.last_name,
        Therapist.available_to_call,
    ]

    column_sortable_list = [
        Therapist.first_name,
        Therapist.last_name,
        Therapist.available_to_call,
    ]

    column_formatters = {
        "tags": lambda m, a: [tag.title for tag in m.tags],
        "client_requests": lambda m, a: [request.id for request in m.client_requests],
    }

    form_excluded_columns = [
        Therapist.photo,
    ]


class ClientRequestsAdmin(BaseModelView, model=ClientRequest):
    name = "Заявка"
    name_plural = "Заявки"
    column_list = [
        ClientRequest.client_id,
        ClientRequest.created_at,
        ClientRequest.is_approved,
        "tags",
        "short_lists"
    ]

    column_searchable_list = [
        ClientRequest.client_id,
        ClientRequest.is_approved,
        ClientRequest.created_at,  
    ]

    column_formatters = {
        "tags": lambda m, a: (tag.title for tag in m.tags),
        "client_requests_therapists": lambda m, a: [client_request_therapist.therapist_id for client_request_therapist in m.client_requests_therapists],
    }

    column_sortable_list = [
        ClientRequest.is_approved,
    ]
