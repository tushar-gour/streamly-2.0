"""Build compact CI visual references and screenshots without external uploads."""

import base64
import io
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


def emit_sheets(directory, prefix):
    paths = sorted(Path(directory).glob("*.png"))
    if not paths:
        return
    width, height = 320, 180
    for offset in range(0, len(paths), 6):
        group = paths[offset : offset + 6]
        sheet = Image.new("RGB", (width * 3, (height + 26) * 2), "#1b1d24")
        draw = ImageDraw.Draw(sheet)
        for i, path in enumerate(group):
            x, y = (i % 3) * width, (i // 3) * (height + 26)
            with Image.open(path) as source:
                preview = ImageOps.contain(source.convert("RGB"), (width, height))
                sheet.paste(preview, (x + (width - preview.width) // 2, y))
            draw.text((x + 5, y + height + 5), path.stem[:45], fill="white")
        data = io.BytesIO()
        sheet.save(data, format="JPEG", quality=70, optimize=True)
        payload = base64.b64encode(data.getvalue()).decode("ascii")
        name = f"{prefix}-{offset // 6 + 1}"
        print(f"SHEET_BEGIN {name}")
        for i in range(0, len(payload), 3000):
            print("SHEET_CHUNK " + payload[i : i + 3000])
        print(f"SHEET_END {name}")


if __name__ == "__main__":
    emit_sheets("docs/screen-images", "reference")
    emit_sheets(os.environ.get("BROWSER_OUTPUT", "browser-results"), "browser")
