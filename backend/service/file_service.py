import uuid
from pathlib import Path
import aiofiles
import aiofiles.os
from fastapi import UploadFile, HTTPException
from constants import LIST_MIME_TYPE

class FileService:
    def __init__(self):
        self.MEDIA_DIR = Path("media")
        self.AVATAR_DIR = self.MEDIA_DIR / "avatars"
        self.MAX_FILE_SIZE = 5 * 1024 * 1024

    async def upload_avatar(self, file: UploadFile|None):
        # Шаг 1: проверяем, передан ли файл.
        print(f"[FileService.upload_avatar] file is None: {file is None}")
        if file is None:
            return None

        # Шаг 2: логируем базовые метаданные файла.
        print(f"[FileService.upload_avatar] file.filename: {file.filename}")
        print(f"[FileService.upload_avatar] file.content_type: {file.content_type}")

        # Шаг 3: валидируем MIME-тип.
        if file.content_type not in LIST_MIME_TYPE:
            raise HTTPException(status_code=400, detail="Можно загружать только изображения")

        # Шаг 4: валидируем имя файла.
        if not file.filename:
            raise HTTPException(status_code=400, detail="Некорректное имя файла")

        # Шаг 5: читаем содержимое файла в память и логируем размер.
        content = await file.read()
        print(f"[FileService.upload_avatar] content size (bytes): {len(content)}")

        # Шаг 6: защитная проверка на пустой файл.
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Файл пустой")

        # Шаг 7: проверяем ограничение по размеру.
        if len(content) > self.MAX_FILE_SIZE:
           raise HTTPException(status_code=400, detail="Файл слишком большой")

        # Шаг 8: гарантируем существование директории для аватаров.
        self.AVATAR_DIR.mkdir(parents=True, exist_ok=True)

        # Шаг 9: извлекаем и логируем расширение файла.
        file_extension = Path(file.filename).suffix
        print(f"[FileService.upload_avatar] file extension: {file_extension}")
        if not file_extension:
            raise HTTPException(status_code=400, detail="Нет расширения файла")

        # Шаг 10: формируем целевое имя/путь файла.
        filename = f"{uuid.uuid4()}{file_extension}"
        file_path = self.AVATAR_DIR / filename
        print(f"[FileService.upload_avatar] file_path: {file_path}")

        # Шаг 11: записываем файл на диск в бинарном режиме.
        async with aiofiles.open(file_path, "wb") as out_file:
            await out_file.write(content)
        print("[FileService.upload_avatar] WRITE DONE")

        # Шаг 12: проверяем факт существования файла после записи.
        print(f"[FileService.upload_avatar] exists after write: {file_path.exists()}")

        return f"avatars/{filename}"

    async def delete_photo(self, photo_path: str | None) -> bool:
        if not photo_path:
            return False

        full_path = self.MEDIA_DIR / photo_path

        if not full_path.exists():
            return False

        await aiofiles.os.remove(full_path)
        return True
