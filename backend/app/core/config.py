from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./sprakapp.db"
    secret_key: str = "dev-secret-key-replace-in-production"
    access_token_expire_days: int = 7
    deepl_api_key: str = ""
    mymemory_email: str = ""

    model_config = {"env_file": ".env"}


settings = Settings()
