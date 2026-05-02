from dto.therapist import CreateTherapist


class CreateTherapistResponse(CreateTherapist):
    avatar_path: str | None = None
