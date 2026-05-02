from dto.therapist import UpdateTherapist


class UpdateTherapistResponse(UpdateTherapist):
    avatar_path: str|None = None
    avatar_url: str|None = None