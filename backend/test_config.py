# test_config.py

from app.core.config import settings

print(settings.cloudflare_account_id)
print(settings.cloudflare_api_token[:10])