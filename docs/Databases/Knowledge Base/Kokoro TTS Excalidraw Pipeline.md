---
type: technical-insight
category: tts-pipeline
entropy: low
tool: Kokoro TTS
feature: Neural Voice Synthesis
tags: [knowledge, tts, kokoro, excalidraw, video-generation]
date_discovered: 2025-01-22
status: working
gif: https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif
gif_alt: Robot speaking with perfect voice synthesis
---

# Kokoro TTS Pipeline for Excalidraw Videos

![Robot speaking with perfect voice synthesis](https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif)

## Problem
Need professional neural TTS narration for Excalidraw animation videos.

## Critical Discovery
The key fix was using the venv Python from local-voice-ai server:
```bash
/Users/speed/Downloads/local-voice-ai/server/venv/bin/python
```

## Working Solution

### Core Python Script for Kokoro TTS
```python
import sys
sys.path.insert(0, '/Users/speed/Downloads/local-voice-ai/server')
from kokoro_worker import Worker
import json
import base64
import numpy as np
import wave

# Initialize worker
worker = Worker()
init_result = worker.initialize("prince-canuma/Kokoro-82M", "af_sarah")

# Generate audio
result = worker.generate("Your text here")

# Decode and save audio
if result.get('success'):
    audio_b64 = result['audio']
    audio_bytes = base64.b64decode(audio_b64)
    audio_int16 = np.frombuffer(audio_bytes, dtype=np.int16)
    
    # Save as WAV
    with wave.open("output.wav", 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(24000)
        wav_file.writeframes(audio_int16.tobytes())
```

## Pipeline Architecture

1. **Input**: Excalidraw diagrams with narration text
2. **Kokoro TTS**: Generate neural voice for each segment
3. **FFmpeg**: Concatenate audio clips seamlessly
4. **Video Merge**: Replace audio track in existing video
5. **Output**: Professional 1080p 60fps video with neural voice

## Key Features
- ✅ REAL Kokoro TTS neural voice synthesis
- ✅ Progressive SVG animations from Excalidraw
- ✅ Synchronized audio-visual presentation
- ✅ 1080p 60fps video output
- ✅ Automatic YouTube-ready formatting

## Why Low Entropy
Once you have the correct venv path and imports, this works reliably every time. The pattern is reusable for any TTS + video pipeline.

## Implementation Files
- `create-ultimate-kokoro.js` - Main pipeline orchestrator
- Uses local Kokoro models at `/Users/speed/Downloads/local-voice-ai/server`
- Outputs to `output/ultimate-kokoro/`

## Success Indicators
```
🎤 Generating REAL Kokoro TTS
✅ REAL Kokoro Audio: 3.45s
✅ Seamless audio track created
✅ Ultimate video created!
```

## Related
- [[Excalidraw SVG Animation]]
- [[FFmpeg Audio Processing]]
- [[Neural TTS Systems]]