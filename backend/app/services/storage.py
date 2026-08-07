import base64
import uuid

import cloudinary
import cloudinary.uploader

from app.core.config import settings

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True,
)


def upload_image_bytes(image_bytes: bytes, folder: str = "ai-product-image-generator") -> str:
    """Upload raw image bytes to Cloudinary and return the public HTTPS URL."""
    result = cloudinary.uploader.upload(
        image_bytes,
        folder=folder,
        public_id=str(uuid.uuid4()),
        resource_type="image",
    )
    return result["secure_url"]


def upload_image_base64(b64_data: str, folder: str = "ai-product-image-generator") -> str:
    return upload_image_bytes(base64.b64decode(b64_data), folder=folder)
