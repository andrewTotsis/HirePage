"""Generate the HirePage 'HP' logo as PNG (light + dark) and an OG image."""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "public")
os.makedirs(OUT, exist_ok=True)


def find_font(size):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVu-Sans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def rounded_rect(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def make_logo(filename, size=512, bg=(10, 10, 11), fg=(255, 255, 255)):
    pad = int(size * 0.04)
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Rounded square background
    radius = int(size * 0.22)
    rounded_rect(d, (pad, pad, size - pad, size - pad), radius=radius, fill=bg + (255,))

    # Draw "HP" wordmark centered
    text = "HP"
    # Try a nice big bold font
    font_size = int(size * 0.46)
    font = find_font(font_size)

    # Measure
    bbox = d.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (size - tw) / 2 - bbox[0]
    ty = (size - th) / 2 - bbox[1] - int(size * 0.02)
    d.text((tx, ty), text, font=font, fill=fg + (255,))

    # Subtle inner stroke
    d.rounded_rectangle(
        (pad + 1, pad + 1, size - pad - 1, size - pad - 1),
        radius=radius,
        outline=(255, 255, 255, 18),
        width=2,
    )

    img.save(filename, "PNG", optimize=True)
    print("wrote", filename)


def make_favicon(filename, size=64):
    make_logo(filename, size=size)


def make_og(filename, w=1200, h=630):
    bg = (10, 10, 11)
    img = Image.new("RGB", (w, h), bg)
    d = ImageDraw.Draw(img)

    # Subtle radial via overlay
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for i in range(80):
        alpha = max(0, 60 - i)
        r = 600 - i * 6
        od.ellipse((w // 2 - r, -r // 2, w // 2 + r, h // 2 + r // 2), fill=(255, 255, 255, alpha // 8))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    d = ImageDraw.Draw(img)

    # Logo mark (small) in top-left
    mark_size = 84
    pad = 56
    radius = int(mark_size * 0.22)
    d.rounded_rectangle((pad, pad, pad + mark_size, pad + mark_size), radius=radius, fill=(255, 255, 255))
    f_mark = find_font(int(mark_size * 0.5))
    bbox = d.textbbox((0, 0), "HP", font=f_mark)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    d.text(
        (pad + (mark_size - tw) / 2 - bbox[0], pad + (mark_size - th) / 2 - bbox[1] - 2),
        "HP",
        font=f_mark,
        fill=(10, 10, 11),
    )
    f_brand = find_font(34)
    d.text((pad + mark_size + 18, pad + 22), "HirePage", font=f_brand, fill=(255, 255, 255))

    # Headline
    f_h = find_font(78)
    f_sub = find_font(32)
    headline_lines = [
        "Stand Out. Get Noticed.",
        "Get Hired.",
    ]
    y = 240
    for line in headline_lines:
        d.text((pad, y), line, font=f_h, fill=(255, 255, 255))
        y += 92
    d.text(
        (pad, y + 20),
        "Professional personal websites for job seekers.",
        font=f_sub,
        fill=(180, 180, 188),
    )

    img.save(filename, "PNG", optimize=True)
    print("wrote", filename)


if __name__ == "__main__":
    make_logo(os.path.join(OUT, "logo.png"), size=512)
    make_logo(os.path.join(OUT, "logo-light.png"), size=512, bg=(255, 255, 255), fg=(10, 10, 11))
    make_favicon(os.path.join(OUT, "favicon.png"), size=64)
    make_og(os.path.join(OUT, "og.png"))
