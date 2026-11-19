"""Subida de vídeos a la BANDEJA (borradores) de TikTok con la Content Posting API (modo Sandbox).

Credenciales: variables de entorno TIKTOK_CLIENT_KEY y TIKTOK_CLIENT_SECRET (las pone el usuario en la
configuración del entorno; nunca en el repo ni en el chat). Tokens del usuario en un JSON privado
(--tokens, por defecto ~/.tiktok_tokens.json), que el coordinador sincroniza con un archivo privado de Drive.

Uso:
  python3 tiktok.py auth-url                       # enlace para dar permiso a la cuenta
  python3 tiktok.py exchange <url_de_vuelta_o_code> # canjea el código por tokens (se guardan, no se imprimen)
  python3 tiktok.py refresh                         # renueva el access token (dura 24 h)
  python3 tiktok.py upload <video.mp4>              # sube a la bandeja; imprime publish_id
  python3 tiktok.py status <publish_id>
"""
import json, os, sys, time, urllib.parse, urllib.request, secrets
from pathlib import Path

API = "https://open.tiktokapis.com/v2"
REDIRECT = os.environ.get("TIKTOK_REDIRECT_URI", "https://github.com/ByLuso/OpenMontage")
SCOPES = "user.info.basic,video.upload"
TOK = Path(os.environ.get("TIKTOK_TOKENS", Path.home() / ".tiktok_tokens.json"))


def env(k):
    v = os.environ.get(k)
    if not v:
        sys.exit(f"Falta la variable de entorno {k} (configuración del entorno → Editar).")
    return v


def post(url, data=None, form=None, token=None):
    if form is not None:
        body, ctype = urllib.parse.urlencode(form).encode(), "application/x-www-form-urlencoded"
    else:
        body, ctype = json.dumps(data or {}).encode(), "application/json; charset=UTF-8"
    req = urllib.request.Request(url, data=body, method="POST", headers={"Content-Type": ctype})
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"error": {"http": e.code, "body": e.read().decode()[:500]}}


def save(tok):
    tok["obtained_at"] = int(time.time())
    TOK.write_text(json.dumps(tok)); os.chmod(TOK, 0o600)


def access_token():
    if not TOK.exists():
        sys.exit("No hay tokens: hace falta 'exchange' primero.")
    tok = json.loads(TOK.read_text())
    if time.time() > tok["obtained_at"] + tok.get("expires_in", 86400) - 600:
        tok = refresh()
    return tok["access_token"]


def refresh():
    tok = json.loads(TOK.read_text())
    r = post(f"{API}/oauth/token/", form={"client_key": env("TIKTOK_CLIENT_KEY"), "client_secret": env("TIKTOK_CLIENT_SECRET"),
                                          "grant_type": "refresh_token", "refresh_token": tok["refresh_token"]})
    if "access_token" not in r:
        sys.exit(f"No se pudo renovar: {r}")
    save(r); print("token renovado; caduca en", r.get("expires_in"), "s; refresh en", r.get("refresh_expires_in"), "s")
    return json.loads(TOK.read_text())


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "auth-url":
        q = {"client_key": env("TIKTOK_CLIENT_KEY"), "scope": SCOPES, "response_type": "code",
             "redirect_uri": REDIRECT, "state": secrets.token_hex(8)}
        print("https://www.tiktok.com/v2/auth/authorize/?" + urllib.parse.urlencode(q))
    elif cmd == "exchange":
        arg = sys.argv[2]
        code = urllib.parse.parse_qs(urllib.parse.urlparse(arg).query).get("code", [arg])[0]
        r = post(f"{API}/oauth/token/", form={"client_key": env("TIKTOK_CLIENT_KEY"), "client_secret": env("TIKTOK_CLIENT_SECRET"),
                                              "code": code, "grant_type": "authorization_code", "redirect_uri": REDIRECT})
        if "access_token" not in r:
            sys.exit(f"Canje fallido: {r}")
        save(r); print("OK: cuenta conectada; permisos:", r.get("scope"))
    elif cmd == "refresh":
        refresh()
    elif cmd == "upload":
        src = Path(sys.argv[2]); p = src.with_name(src.stem + "_tiktok.mp4")
        # recodificar a lo más estándar: yuv420p rango limitado, BT.709, AAC 44,1 kHz, moov al principio
        import subprocess
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                        "-pix_fmt", "yuv420p", "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
                        "-profile:v", "high", "-level", "4.1", "-r", "30", "-c:a", "aac", "-b:a", "192k", "-ar", "44100",
                        "-movflags", "+faststart", str(p)], check=True)
        n = p.stat().st_size
        if n > 64 * 1024 * 1024:
            sys.exit("Vídeo > 64 MB: hace falta subir en trozos (no implementado).")
        tok = access_token()
        r = post(f"{API}/post/publish/inbox/video/init/", token=tok,
                 data={"source_info": {"source": "FILE_UPLOAD", "video_size": n, "chunk_size": n, "total_chunk_count": 1}})
        d = r.get("data", {})
        if not d.get("upload_url"):
            sys.exit(f"init fallido: {r}")
        req = urllib.request.Request(d["upload_url"], data=p.read_bytes(), method="PUT",
                                     headers={"Content-Type": "video/mp4", "Content-Length": str(n), "Content-Range": f"bytes 0-{n - 1}/{n}"})
        with urllib.request.urlopen(req, timeout=300) as u:
            print("subido:", u.status, "publish_id:", d["publish_id"])
    elif cmd == "status":
        print(json.dumps(post(f"{API}/post/publish/status/fetch/", token=access_token(), data={"publish_id": sys.argv[2]}), ensure_ascii=False))
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
