from app.core.config import settings


print("ACCOUNT:")
print(settings.cloudflare_account_id)

print("TOKEN:")
print(settings.cloudflare_api_token[:10])