"""AI image generation service.

Primary provider: Google Gemini 2.5 Flash Image ("Nano Banana") - free tier
via Google AI Studio API key. Falls back to Pollinations.ai (fully free,
no API key) if Gemini fails or no key is configured, so the app keeps
working even if the Gemini free quota runs out for the day.
"""

import base64
import urllib.parse

import httpx

from app.core.config import settings

POLLINATIONS_BASE = "https://image.pollinations.ai/prompt/"


def _generate_with_gemini(prompt: str, source_image_bytes: bytes | None) -> bytes:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=settings.gemini_api_key)

    contents: list = [prompt]
    if source_image_bytes:
        contents.append(
            types.Part.from_bytes(data=source_image_bytes, mime_type="image/png")
        )

    response = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=contents,
    )

    for part in response.candidates[0].content.parts:
        if getattr(part, "inline_data", None) is not None:
            return part.inline_data.data

    raise RuntimeError("Gemini did not return an image")


def _generate_with_pollinations(prompt: str) -> bytes:
    encoded_prompt = urllib.parse.quote(prompt)
    url = f"{POLLINATIONS_BASE}{encoded_prompt}?width=1024&height=1024&nologo=true"
    with httpx.Client(timeout=60.0) as client:
        resp = client.get(url)
        resp.raise_for_status()
        return resp.content


def generate_image(prompt: str, source_image_bytes: bytes | None = None) -> bytes:
    """Return raw image bytes for the given prompt.

    Tries Gemini first (if configured); falls back to Pollinations.ai
    on any failure so the feature stays free and available.
    """
    if settings.gemini_api_key:
        try:
            return _generate_with_gemini(prompt, source_image_bytes)
        except Exception:
            pass  # fall through to free fallback

    return _generate_with_pollinations(prompt)


def image_bytes_to_base64(data: bytes) -> str:
    return base64.b64encode(data).decode("utf-8")
