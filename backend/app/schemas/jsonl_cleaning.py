# cpu_cleaning.py
import re
import hashlib

def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def is_structurally_valid(fb) -> bool:
    if not fb.prompt or not fb.corrected_response:
        return False

    prompt = fb.prompt.strip()
    output = fb.corrected_response.strip()

    if not prompt or not output:
        return False

    if len(output) < 5 or len(output) > 5000:
        return False

    if normalize_text(prompt) == normalize_text(output):
        return False

    return True


def fingerprint_record(prompt, model_resp, corrected):
    payload = (
        normalize_text(prompt)
        + "|"
        + normalize_text(model_resp or "")
        + "|"
        + normalize_text(corrected)
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def deduplicate(feedbacks):
    seen = set()
    unique = []

    for fb in feedbacks:
        fp = fingerprint_record(
            fb.prompt,
            fb.model_response,
            fb.corrected_response
        )
        if fp in seen:
            continue
        seen.add(fp)
        unique.append(fb)

    return unique


PII_PATTERNS = [
    r"\b\d{10}\b",
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
    r"api[_-]?key\s*=\s*\S+",
    r"password\s*[:=]\s*\S+",
]

def has_pii(fb) -> bool:
    text = fb.corrected_response or ""
    return any(re.search(p, text) for p in PII_PATTERNS)


MISALIGNMENT_PATTERNS = [
    "as an ai",
    "i cannot help",
    "the model should have",
]

def is_misaligned(fb) -> bool:
    output = normalize_text(fb.corrected_response or "")
    return any(p in output for p in MISALIGNMENT_PATTERNS)


def cpu_clean(feedbacks):
    filtered = []

    for fb in feedbacks:
        if not is_structurally_valid(fb):
            continue
        if has_pii(fb):
            continue
        if is_misaligned(fb):
            continue

        filtered.append(fb)

    return deduplicate(filtered)
