# 常用语药丸：灰色小胶囊，一闪而过，不盖章（澄怀 2026-10-27 方案）
import sys
from PIL import Image, ImageDraw, ImageFont

FB = r"C:/Windows/Fonts/msyhbd.ttc"
FR = r"C:/Windows/Fonts/msyh.ttc"
TEXT = (226, 232, 240)
PILL = (100, 116, 139, 210)

def pill(word, sub, out, scale=2.0):
    f = ImageFont.truetype(FR, int(28*scale))
    label = word + "  " + sub if sub else word
    tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    tw = int(tmp.textlength(label, font=f))
    w, h = tw + int(40*scale), int(52*scale)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w-1, h-1], radius=h//2, fill=PILL)
    d.text((int(20*scale), int(10*scale)), label, font=f, fill=TEXT+(255,))
    img.save(out)
    return out

if __name__ == "__main__":
    print(pill(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "", sys.argv[3]))
