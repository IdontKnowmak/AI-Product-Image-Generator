from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    database_url: str = (
        "postgresql+psycopg://postgres:postgres@localhost:5432/product_image_gen"
    )

    # JWT auth
    jwt_secret: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7

    # Cloudflare Workers AI
    cloudflare_account_id: str = ""
    cloudflare_api_token: str = ""

    # Gemini
    gemini_api_key: str = ""

    # Cloudinary
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    # CORS
    # Comma-separated frontend origins, e.g. http://localhost:3000,http://192.168.1.10:3000
    frontend_origin: str = "http://localhost:3000,http://127.0.0.1:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()