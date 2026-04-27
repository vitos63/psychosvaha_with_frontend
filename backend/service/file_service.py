import uuid
from pathlib import Path
import aiofiles.os
from fastapi import UploadFile, HTTPException


class FileService:
    def __init__(self):
        self.MEDIA_DIR = Path("media")
        self.AVATAR_DIR = self.MEDIA_DIR / "avatars"

    async def upload_avatar(self, file: UploadFile|None):
        if file is None:
            return None


        if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
            raise HTTPException(status_code=400, detail="Можно загружать только изображения")

        self.AVATAR_DIR.mkdir(parents=True, exist_ok=True)

        file_extension = Path(file.filename).suffix
        filename = f"{uuid.uuid4()}{file_extension}"

        file_path = self.AVATAR_DIR / filename

        async with aiofiles.open(file_path, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)

        return f"avatars/{filename}"

    async def delete_photo(self, photo_path: str | None) -> bool:
        """
        Удаляет файл по пути из media.

        Пример:
            avatars/test.jpg
        """
        if not photo_path:
            return False

        full_path = self.MEDIA_DIR / photo_path

        if not full_path.exists():
            return False

        await aiofiles.os.remove(full_path)
        return True
