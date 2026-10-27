# 表情包匹配：截图里的表情与 B 站表情素材做模板匹配（alpha 合成到深色底）
import sys, os, json
import cv2, numpy as np

EMOTE_DIR = os.environ.get("MEME_EMOTE_DIR") or os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "emotes")
SCALES = [0.2, 0.25, 0.3, 0.4, 0.5, 0.7, 1.0, 1.3]
THRESH = float(os.environ.get("EMOTE_THRESH", "0.78"))

def prep(img):
    if img.shape[2] == 4:
        a = img[:, :, 3].astype(np.float32) / 255.0
        bgr = img[:, :, :3].astype(np.float32)
        comp = (bgr * a[..., None]).astype(np.uint8)
        return cv2.cvtColor(comp, cv2.COLOR_BGR2GRAY)
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

def match(path, topk=5):
    shot = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
    if shot is None: return {"ok": False, "error": "READ_FAIL"}
    hits = []
    for f in os.listdir(EMOTE_DIR):
        if not f.endswith(".png"): continue
        img = cv2.imread(os.path.join(EMOTE_DIR, f), cv2.IMREAD_UNCHANGED)
        if img is None: continue
        g = prep(img)
        best = 0.0
        for s in SCALES:
            h, w = int(g.shape[0] * s), int(g.shape[1] * s)
            if h < 8 or w < 8 or h >= shot.shape[0] or w >= shot.shape[1]: continue
            t = cv2.resize(g, (w, h), interpolation=cv2.INTER_AREA)
            v = float(cv2.matchTemplate(shot, t, cv2.TM_CCOEFF_NORMED).max())
            if v > best: best = v
        if best >= THRESH: hits.append({"name": f[:-4], "score": round(best, 3)})
    hits.sort(key=lambda x: -x["score"])
    # 去重：同一张图只留最高分
    seen, out = set(), []
    for h in hits:
        if h["name"] in seen: continue
        seen.add(h["name"]); out.append(h)
    return {"ok": True, "count": len(out), "matches": out[:topk]}

if __name__ == "__main__":
    print(json.dumps(match(sys.argv[1]), ensure_ascii=False))
