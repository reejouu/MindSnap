"""import yt_dlp
import os

def download_audio(url, output_path="audio.mp3"):
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': 'temp_audio.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
        }],
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    for ext in ['mp3', 'm4a']:
        if os.path.exists(f'temp_audio.{ext}'):
            os.rename(f'temp_audio.{ext}', output_path)
            return output_path"""
import os
import yt_dlp
import PyPDF2

def download_audio(url, output_path="audio.mp3"):
    """
    Downloads audio from a YouTube URL and saves it as an MP3 file.
    """
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': 'temp_audio.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
        }],
        'quiet': True
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    for ext in ['mp3', 'm4a']:
        if os.path.exists(f'temp_audio.{ext}'):
            os.rename(f'temp_audio.{ext}', output_path)
            return output_path

    raise FileNotFoundError("Audio download failed.")


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extracts text from a PDF file using PyPDF2.
    """
    text = ""
    try:
        with open(pdf_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        raise RuntimeError(f"Error reading PDF: {e}")
    return text.strip()


def read_text_from_input() -> str:
    """
    Accepts multiline text input from the user until EOF (Ctrl+D/Ctrl+Z).
    """
    print("\n🧾 Paste or type your transcript text below.")
    print("(Press Ctrl+D on Linux/macOS or Ctrl+Z on Windows to finish):\n")

    transcript = ""
    try:
        while True:
            line = input()
            transcript += line + "\n"
    except EOFError:
        pass
    return transcript.strip()

