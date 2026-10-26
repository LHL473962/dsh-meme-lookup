# -*- coding: utf-8 -*-
"""梗教练报告卡渲染（PIL），按澄怀 2026-10-27 的参数：
1920x1080 画布，卡片 960x360，X480/Y360，圆角20，字号 36/48/28/22。
"""
import json, sys
from PIL import Image, ImageDraw, ImageFont

FB = r"C:/Windows/Fonts/msyhbd.ttc"
FR = r"C:/Windows/Fonts/msyh.ttc"

BG      = (30, 42, 60)      # #1E2A3C
TEXT    = (226, 232, 240)   # #E2E8F0
SUB     = (148, 163, 184)   # #94A3B8
PILL_BG = (38, 52, 75, 180) # 半透明胶囊底
STROKE  = (100, 116, 139)   # #64748B
GREEN   = (16, 185, 129)
AMBER   = (245, 158, 11)
GREY    = (100, 116, 139)

STATE = {
    "USABLE":          ("可用", GREEN),
    "USE_WITH_CARE":   ("慎用", AMBER),
    "UNKNOWN":         ("暂无收录", GREY),
}

def render(data, out, scale=1.0):
    W, H = int(1920*scale), int(1080*scale)
    cw, ch = int(960*scale), int(360*scale)
    x0, y0 = int(480*scale), int(360*scale)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(20*scale)
    # 卡片
    d.rounded_rectangle([x0, y0, x0+cw, y0+ch], radius=r, fill=BG+ (255,))
    # 状态胶囊
    label, color = STATE.get(data.get("verdict", "UNKNOWN"), STATE["UNKNOWN"])
    f36 = ImageFont.truetype(FB, int(36*scale))
    tw = d.textlength(label, font=f36)
    px0, py0 = x0+int(28*scale), y0+int(24*scale)
    d.rounded_rectangle([px0, py0, px0+tw+int(44*scale), py0+int(56*scale)], radius=int(28*scale), fill=color+(255,))
    d.text((px0+int(22*scale), py0+int(8*scale)), label, font=f36, fill=(255,255,255,255))
    # 标题
    f48 = ImageFont.truetype(FB, int(48*scale))
    d.text((x0+int(28*scale), y0+int(104*scale)), data.get("title","")[:16], font=f48, fill=TEXT+(255,))
    # 出处行（胶囊衬底）
    f28 = ImageFont.truetype(FR, int(28*scale))
    src = data.get("source", "")
    if src:
        tw2 = d.textlength(src, font=f28)
        bx0, by0 = x0+int(28*scale), y0+int(196*scale)
        d.rounded_rectangle([bx0, by0, bx0+tw2+int(36*scale), by0+int(48*scale)], radius=int(24*scale), fill=PILL_BG, outline=STROKE+(255,), width=1)
        d.text((bx0+int(18*scale), by0+int(8*scale)), src, font=f28, fill=TEXT+(255,))
    # 小字
    f22 = ImageFont.truetype(FR, int(22*scale))
    y = y0+int(262*scale)
    for line in (data.get("advice") or [])[:2]:
        d.text((x0+int(28*scale), y), line[:34], font=f22, fill=SUB+(255,))
        y += int(30*scale)
    img.save(out)
    return out

if __name__ == "__main__":
    data = json.load(open(sys.argv[1], encoding="utf-8"))
    print(render(data, sys.argv[2]))
