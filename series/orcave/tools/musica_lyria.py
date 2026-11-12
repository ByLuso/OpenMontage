import asyncio, sys, wave, os
sys.path.insert(0, ".")
from google.genai import types
from tools.google_credentials import get_genai_client
OUT, SECS = sys.argv[1], float(sys.argv[2])
async def main():
    client = get_genai_client()
    buf = bytearray()
    async with client.aio.live.music.connect(model="models/lyria-realtime-exp") as s:
        await s.set_weighted_prompts(prompts=[
            types.WeightedPrompt(text="calm warm cinematic ambient, soft felt piano, warm analog pads, gentle pulse, winter night, hopeful", weight=1.0),
            types.WeightedPrompt(text="minimal soft percussion, lo-fi texture", weight=0.4)])
        await s.set_music_generation_config(config=types.LiveMusicGenerationConfig(bpm=88, temperature=1.0, density=0.35, brightness=0.45))
        await s.play()
        async for msg in s.receive():
            if msg.server_content and msg.server_content.audio_chunks:
                for c in msg.server_content.audio_chunks: buf.extend(c.data)
            if len(buf) >= SECS * 48000 * 2 * 2: break
    with wave.open(OUT, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(48000); w.writeframes(bytes(buf))
    print("ok", len(buf) / (48000 * 4), "s")
asyncio.run(main())
