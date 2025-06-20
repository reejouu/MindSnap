import os
import time
from faster_whisper import WhisperModel

def transcribe_audio(audio_path):
    try:
        # Add this memory check for long videos
        import torch
        if torch.cuda.is_available():
            free_mem = torch.cuda.mem_get_info()[0] / (1024**3)  # GB
            if free_mem < 2:  # Less than 2GB free
                print("⚠️ Low GPU memory - switching to CPU")
                device = "cpu"
            else:
                device = "cuda"
        else:
            device = "cpu"

        print(f"📝 Loading model (device: {device})...")
        model = WhisperModel("base", device=device, compute_type="float16")

        # Add timeout for long files (30 mins max)
        from threading import Timer
        import functools
        
        def timeout_handler():
            raise TimeoutError("Transcription timed out after 30 minutes")

        timer = Timer(1800, timeout_handler)  # 30 minute timeout
        timer.start()
        
        try:
            segments, info = model.transcribe(audio_path, beam_size=5)  # More efficient
            transcript = " ".join(segment.text for segment in segments)
        finally:
            timer.cancel()

        # Verify transcript quality
        if len(transcript) < 50:  # Minimum expected characters
            raise ValueError("Transcript too short - possible transcription failure")
            
        return transcript

    except Exception as e:
        print(f"❌ Transcription Error: {str(e)}")
        raise  # Re-raise to handle in main.py