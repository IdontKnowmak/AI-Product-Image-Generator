from app.core.config import settings
from google import genai

print("Key:", settings.gemini_api_key[:10])

client = genai.Client(
    api_key=settings.gemini_api_key
)

print("Client created successfully")