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

    if len(output) < 5:
        return False

    if len(output) > 5000:
        return False

    if normalize_text(prompt) == normalize_text(output):
        return False

    return True


def fingerprint_record(instruction, input_text, output):
    payload = normalize_text(instruction) + "|" + normalize_text(input_text) + "|" + normalize_text(output)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def deduplicate(feedbacks):
    seen = set()
    unique = []

    for fb in feedbacks:
        fp = fingerprint_record(
            fb.prompt,
            fb.model_response or "",
            fb.corrected_response or ""
        )

        if fp in seen:
            continue

        seen.add(fp)
        unique.append(fb)

    return unique


TOXIC_PATTERNS = [
    r"\b(slur1|slur2|slur3)\b",
    r"\b(kill|rape|genocide)\b",
]

def contains_toxic_content(text: str) -> bool:
    text = text.lower()
    return any(re.search(p, text) for p in TOXIC_PATTERNS)



def is_toxic(fb) -> bool:
    output = fb.corrected_response or ""
    return contains_toxic_content(output)



PII_PATTERNS = [
    r"\b\d{10}\b",  # phone
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
    r"api[_-]?key\s*=\s*[A-Za-z0-9]+",
    r"password\s*[:=]\s*\S+",
]

def contains_pii(text: str) -> bool:
    return any(re.search(p, text) for p in PII_PATTERNS)


def has_pii(fb) -> bool:
    return contains_pii(fb.corrected_response or "")



MISALIGNMENT_PATTERNS = [
    r"as an ai",
    r"i cannot help with",
    r"this response is incorrect",
    r"the model should have",
]

def is_misaligned(fb) -> bool:
    output = normalize_text(fb.corrected_response or "")
    return any(p in output for p in MISALIGNMENT_PATTERNS)


# LOW_SIGNAL_OUTPUTS = {
#     "it depends",
#     "maybe",
#     "not sure",
#     "i don't know",
# }

# def is_low_signal(fb) -> bool:
#     output = normalize_text(fb.corrected_response or "")
#     return output in LOW_SIGNAL_OUTPUTS


# def is_trainable(fb) -> bool:
#     output = fb.corrected_response.strip()
#     return len(output.split()) >= 3



# cleaning Pipeline
def clean_feedbacks(feedbacks):
    cleaned = []

    for fb in feedbacks:
        if not is_structurally_valid(fb):
            continue
        if is_toxic(fb):
            continue
        if has_pii(fb):
            continue
        if is_misaligned(fb):
            continue

        cleaned.append(fb)

    cleaned = deduplicate(cleaned)

    return cleaned
