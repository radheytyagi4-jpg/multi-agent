
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

def get_llm(model: str, temperature: float = 0.2 , max_tokens: int = 4096):
    return ChatOpenAI(
        model=model,
        openai_api_key=os.getenv("OPENROUTER_API_KEY"),
        openai_api_base=os.getenv("OPENROUTER_BASE_URL"),
        temperature=temperature,
        max_tokens=max_tokens
    )
