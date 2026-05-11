import json

from fastapi import Form, HTTPException

from dto.therapist import UpdateTherapist


class UpdateTherapistRequest(UpdateTherapist):
    @classmethod
    def as_form(
        cls,
        first_name: str = Form(...),
        last_name: str = Form(...),
        city: str | None = Form(None),
        phone_number: str | None = Form(None),
        email: str | None = Form(None),
        pitch: str | None = Form(None),
        site: str | None = Form(None),
        sex: str = Form(...),
        age: int = Form(...),
        experience: int = Form(...),
        min_client_age: int = Form(...),
        max_client_age: int = Form(...),
        online: bool = Form(False),
        consent: bool = Form(False),
        currency_amount: str = Form("{}"),
        contacts_for_client: str | None = Form(None),
        available_to_call: bool = Form(False),
        tag_ids: str = Form("[]"),
        avatar_path: str | None = Form(None),
    ) -> "UpdateTherapistRequest":
        try:
            parsed_currency_amount = json.loads(currency_amount)
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=422, detail="currency_amount must be valid JSON object") from exc
        if not isinstance(parsed_currency_amount, dict):
            raise HTTPException(status_code=422, detail="currency_amount must be a JSON object")

        try:
            parsed_tag_ids = json.loads(tag_ids)
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=422, detail="tag_ids must be valid JSON list[int]") from exc
        if not isinstance(parsed_tag_ids, list) or not all(isinstance(tag_id, int) for tag_id in parsed_tag_ids):
            raise HTTPException(status_code=422, detail="tag_ids must be a JSON list[int]")

        return cls(
            first_name=first_name,
            last_name=last_name,
            city=city or None,
            phone_number=phone_number or None,
            email=email or None,
            pitch=pitch or None,
            site=site or None,
            sex=sex,
            age=age,
            experience=experience,
            min_client_age=min_client_age,
            max_client_age=max_client_age,
            online=online,
            consent=consent,
            currency_amount=parsed_currency_amount,
            contacts_for_client=contacts_for_client or None,
            available_to_call=available_to_call,
            tag_ids=parsed_tag_ids,
            avatar_path=avatar_path or None,
        )
