from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/product_image_gen"

    # JWT auth
    jwt_secret: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    cloudflare_account_id: str = ""
    cloudflare_api_token: str = ""

    # Gemini (Google AI Studio) - image generation
    gemini_api_key: str = ""

    # Cloudinary - image storage
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    # CORS
    frontend_origin: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
