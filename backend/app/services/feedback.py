import re

def extract_by_path(data: dict, path: str):
    """
    Extract value from nested dict using paths like:
    choices[0].message.content
    """
    current = data
    for part in re.split(r"\.(?![^\[]*\])", path):
        match = re.match(r"(\w+)(?:\[(\d+)\])?", part)
        if not match:
            raise KeyError(part)

        key, index = match.groups()
        current = current[key]

        if index is not None:
            current = current[int(index)]

    return current
