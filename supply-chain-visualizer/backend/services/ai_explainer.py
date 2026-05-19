import logging

import httpx

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
OLLAMA_TIMEOUT = 45.0

logger = logging.getLogger(__name__)


def get_ai_insight(package: str, severity: str, cve_id: str, description: str) -> str:
    prompt = (
        "You are a cybersecurity assistant. Explain this vulnerability in simple professional language. "
        "Include: 1. What the issue means 2. Potential impact 3. Suggested remediation. Keep the answer concise and practical.\n"
        f"Package: {package}\n"
        f"Severity: {severity}\n"
        f"CVE: {cve_id}\n"
        f"Description: {description}"
    )

    payload = {"model": "llama3", "prompt": prompt, "stream": False}

    try:
        with httpx.Client(timeout=httpx.Timeout(90.0, connect=10.0)) as client:
            resp = client.post(OLLAMA_URL, json=payload)
            resp.raise_for_status()
            data = resp.json()
        return (data.get("response", "") or "").strip()
    except (httpx.ReadTimeout, httpx.RequestError):
        logger.exception("Timeout or request error when getting AI insight from Ollama")
        return "AI insight generation timed out. Please try refreshing or check local system resources."
    except Exception:
        logger.exception("Failed to get AI insight from Ollama")
        return "AI insight unavailable"
