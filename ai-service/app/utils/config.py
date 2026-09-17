from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ai_service_port: int = 8000
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"
    cors_origins: str = "http://localhost:5173,http://localhost:3001"


settings = Settings()
