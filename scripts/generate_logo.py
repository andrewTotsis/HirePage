"""Polished Option 5 logo: dark gradient tile + HP wordmark + subtle sheen + green status dot.
Outputs: logo.png (512), logo@1024.png (1024), favicon.png (64), og.png (1200x630), logo-light.png.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "public")
os.makedirs(OUT, exist_ok=True)


def find_font(size, bold=True):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def polished_logo(path, size=512, bg_light=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    # Build a vertical gradient (slate-900 -> near-black) OR light variant
    grad = Image.new("RGB", (size, size))
    gd = ImageDraw.Draw(grad)
    if bg_light:
        for y in range(size):
            t = y / size
            r = int(255 + (245 - 255) * t)
            g = int(255 + (245 - 255) * t)
            b = int(255 + (248 - 255) * t)
            gd.line([(0, y), (size, y)], fill=(r, g, b))
    else:
        for y in range(size):
            t = y / size
            # top: #1f2330  bottom: #07070a
            r = int(31 + (7 - 31) * t)
            g = int(35 + (7 - 35) * t)
            b = int(48 + (10 - 48) * t)
            gd.line([(0, y), (size, y)], fill=(r, g, b))

    # Rounded mask
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    radius = int(size * 0.22)
    md.rounded_rectangle((0, 0, size, size), radius=radius, fill=255)
    img.paste(grad, (0, 0), mask)

    d = ImageDraw.Draw(img)

    # Subtle top sheen (clipped to rounded mask)
    if not bg_light:
        sheen = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        sd = ImageDraw.Draw(sheen)
        sheen_h = int(size * 0.50)
        # soft elliptical highlight across the top
        sd.ellipse(
            (-int(size * 0.1), -int(size * 0.55), size + int(size * 0.1), sheen_h),
            fill=(255, 255, 255, 16),
        )
        sheen = sheen.filter(ImageFilter.GaussianBlur(int(size * 0.04)))
        # Clip sheen to rounded mask by multiplying alpha
        sheen_alpha = sheen.split()[3]
        combined_alpha = Image.new("L", (size, size), 0)
        ca_pixels = combined_alpha.load()
        sa = sheen_alpha.load()
        mk = mask.load()
        for y in range(size):
            for x in range(size):
                ca_pixels[x, y] = (sa[x, y] * mk[x, y]) // 255
        sheen.putalpha(combined_alpha)
        img = Image.alpha_composite(img, sheen)

    d = ImageDraw.Draw(img)

    # Inner hairline border
    d.rounded_rectangle(
        (1, 1, size - 1, size - 1),
        radius=radius,
        outline=(255, 255, 255, 26) if not bg_light else (10, 10, 11, 18),
        width=2,
    )

    # HP wordmark — centered, tight
    text = "HP"
    fg = (10, 10, 11, 255) if bg_light else (255, 255, 255, 255)
    font_size = int(size * 0.44)
    f = find_font(font_size, bold=True)
    bbox = d.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (size - tw) / 2 - bbox[0]
    ty = (size - th) / 2 - bbox[1] - int(size * 0.025)

    # Soft drop shadow behind text
    if not bg_light:
        shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        sdr = ImageDraw.Draw(shadow)
        sdr.text((tx, ty + 4), text, font=f, fill=(0, 0, 0, 90))
        shadow = shadow.filter(ImageFilter.GaussianBlur(4))
        img = Image.alpha_composite(img, shadow)
        d = ImageDraw.Draw(img)

    d.text((tx, ty), text, font=f, fill=fg)

    # Subtle status dot (emerald)
    dot_r = int(size * 0.045)
    cx = size - int(size * 0.14)
    cy = size - int(size * 0.14)
    # Glow
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gdr = ImageDraw.Draw(glow)
    gdr.ellipse((cx - dot_r * 3, cy - dot_r * 3, cx + dot_r * 3, cy + dot_r * 3),
                fill=(34, 197, 94, 60))
    glow = glow.filter(ImageFilter.GaussianBlur(dot_r))
    img = Image.alpha_composite(img, glow)

    d = ImageDraw.Draw(img)
    d.ellipse((cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r), fill=(34, 197, 94, 255))
    # tiny highlight
    d.ellipse(
        (cx - dot_r + 2, cy - dot_r + 2, cx - dot_r + dot_r, cy - dot_r + dot_r),
        fill=(255, 255, 255, 120),
    )

    img.save(path, "PNG", optimize=True)
    print("wrote", path)


def make_favicon(path, size=64):
    polished_logo(path, size=size)


def make_og(path, w=1200, h=630):
    # Base dark gradient canvas
    img = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        r = int(20 + (5 - 20) * t)
        g = int(22 + (5 - 22) * t)
        b = int(30 + (8 - 30) * t)
        d.line([(0, y), (w, y)], fill=(r, g, b))

    # soft radial highlight top-center
    highlight = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    hd = ImageDraw.Draw(highlight)
    for i in range(60):
        alpha = int(70 * (1 - i / 60))
        r = 300 - i * 4
        hd.ellipse(
            (w // 2 - r, -r // 2, w // 2 + r, h // 2 - 40),
            fill=(255, 255, 255, max(alpha // 7, 0)),
        )
    highlight = highlight.filter(ImageFilter.GaussianBlur(30))
    img = Image.alpha_composite(img.convert("RGBA"), highlight).convert("RGB")
    d = ImageDraw.Draw(img)

    # Paste polished logo mark (small)
    mark_size = 96
    mark = Image.new("RGBA", (mark_size, mark_size), (0, 0, 0, 0))
    # Use a mini version of the polished logo
    mini_path = os.path.join(OUT, "_mark_tmp.png")
    polished_logo(mini_path, size=mark_size)
    mark = Image.open(mini_path).convert("RGBA")
    os.remove(mini_path)

    pad_x, pad_y = 64, 64
    img_rgba = img.convert("RGBA")
    img_rgba.alpha_composite(mark, (pad_x, pad_y))

    d = ImageDraw.Draw(img_rgba)
    f_brand = find_font(40)
    d.text((pad_x + mark_size + 20, pad_y + 28), "HirePage", font=f_brand, fill=(255, 255, 255))

    # Headline
    f_h = find_font(74)
    f_sub = find_font(32, bold=False)
    lines = ["Stand Out.", "Get Noticed. Get Hired."]
    y = 260
    for line in lines:
        d.text((pad_x, y), line, font=f_h, fill=(255, 255, 255))
        y += 90

    d.text(
        (pad_x, y + 20),
        "Professional personal websites for job seekers.",
        font=f_sub,
        fill=(175, 178, 190),
    )

    img_rgba.convert("RGB").save(path, "PNG", optimize=True)
    print("wrote", path)


if __name__ == "__main__":
    polished_logo(os.path.join(OUT, "logo.png"), size=512)
    polished_logo(os.path.join(OUT, "logo@1024.png"), size=1024)
    polished_logo(os.path.join(OUT, "logo-light.png"), size=512, bg_light=True)
    make_favicon(os.path.join(OUT, "favicon.png"), size=64)
    make_og(os.path.join(OUT, "og.png"))
