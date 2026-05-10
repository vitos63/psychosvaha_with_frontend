from dto.therapist import UpdateTherapist


class UpdateTherapistResponse(UpdateTherapist):
    avatar_url: str | None = None
