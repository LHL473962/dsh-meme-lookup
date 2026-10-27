import sys, asyncio, io
from PIL import Image
import winocr

async def main(src, dst):
    img = Image.open(src)
    res = await winocr.recognize_pil(img, 'zh-Hans')
    text = " ".join(res.text.split())
    with io.open(dst, "w", encoding="utf-8") as f:
        f.write(text)
    print("OK", len(text))

asyncio.run(main(sys.argv[1], sys.argv[2]))