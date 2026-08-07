"""
AI Image Generation Service

Provider priority:

1. Cloudflare Workers AI
2. Google Gemini fallback

Return:
raw image bytes
"""

from __future__ import annotations

import base64
import logging
import time

import httpx

from google import genai
from google.genai import types

from app.core.config import settings


logger = logging.getLogger(__name__)


# =====================================
# Gemini
# =====================================

def generate_with_gemini(
    prompt: str,
    source_image_bytes: bytes | None = None,
) -> bytes:

    logger.info("Calling Gemini")

    client = genai.Client(
        api_key=settings.gemini_api_key
    )

    contents = [prompt]


    if source_image_bytes:
        contents.append(
            types.Part.from_bytes(
                data=source_image_bytes,
                mime_type="image/png"
            )
        )


    response = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=contents,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"]
        )
    )


    if not response.candidates:
        raise RuntimeError(
            "Gemini returned empty response"
        )


    for part in response.candidates[0].content.parts:

        if getattr(part, "inline_data", None):

            logger.info(
                "Gemini success"
            )

            return part.inline_data.data


    raise RuntimeError(
        "Gemini no image returned"
    )



# =====================================
# Cloudflare Workers AI
# =====================================

def generate_with_cloudflare(
    prompt: str
) -> bytes:


    logger.info(
        "Calling Cloudflare Workers AI"
    )


    url = (
        "https://api.cloudflare.com/client/v4/accounts/"
        f"{settings.cloudflare_account_id}"
        "/ai/run/@cf/bytedance/stable-diffusion-xl-lightning"
    )


    headers = {
        "Authorization":
            f"Bearer {settings.cloudflare_api_token}",

        "Content-Type":
            "application/json"
    }


    payload = {
        "prompt": prompt
    }



    for attempt in range(3):

        try:

            response = httpx.post(
                url,
                headers=headers,
                json=payload,
                timeout=120
            )


            response.raise_for_status()


            content_type = response.headers.get(
                "content-type",
                ""
            )


            logger.info(
                f"Cloudflare response: {content_type}"
            )



            # Cloudflare ส่งรูปตรง

            if (
                "image" in content_type
                or response.content.startswith(b"\x89PNG")
                or response.content.startswith(b"\xff\xd8")
            ):

                logger.info(
                    "Cloudflare image received"
                )

                return response.content



            # Cloudflare ส่ง JSON

            data = response.json()


            if not data.get(
                "success",
                False
            ):

                raise RuntimeError(
                    str(data)
                )


            image_base64 = (
                data["result"]["image"]
            )


            return base64.b64decode(
                image_base64
            )



        except Exception as e:

            logger.warning(
                f"Cloudflare attempt {attempt+1} failed"
            )

            if attempt == 2:
                raise e


            time.sleep(2)



    raise RuntimeError(
        "Cloudflare failed"
    )



# =====================================
# Main
# =====================================

def generate_image(
    prompt: str,
    source_image_bytes: bytes | None = None,
) -> bytes:


    # -------------------------------
    # Cloudflare First
    # -------------------------------

    if (
        settings.cloudflare_account_id
        and settings.cloudflare_api_token
    ):


        try:

            logger.info(
                "Using Cloudflare"
            )


            return generate_with_cloudflare(
                prompt
            )


        except Exception as e:

            logger.warning(
                "Cloudflare failed, fallback Gemini"
            )

            logger.exception(e)



    # -------------------------------
    # Gemini fallback
    # -------------------------------


    if settings.gemini_api_key:


        try:

            logger.info(
                "Using Gemini"
            )


            return generate_with_gemini(
                prompt,
                source_image_bytes
            )


        except Exception as e:

            logger.warning(
                "Gemini failed"
            )

            logger.exception(e)



    raise RuntimeError(
        "No image generation provider available"
    )