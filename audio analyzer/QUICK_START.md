# Quick Start Guide

## 📦 1-Minute Setup

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Configure API Key
```bash
# Copy the example file
cp .env.example .env

# Edit .env file and replace with your actual API key
# OPENAI_API_KEY=your-actual-api-key-here
```

### Step 3: Run the Application
```bash
python audio_analyzer.py your_audio.mp3
```

## 🔧 Automatic Setup Script

Run the setup script for guided installation:

```bash
python setup.py
```

This will:
- ✅ Check Python version
- ✅ Install dependencies  
- ✅ Create output directory
- ✅ Set up .env file
- ✅ Verify API key configuration

## 🎵 Test with Sample Audio

1. **Record a short audio** (or download any MP3/WAV file)
2. **Place it in the project directory**  
3. **Run the analyzer:**
   ```bash
   python audio_analyzer.py test_audio.mp3
   ```

## 📁 Expected Output

After processing, you'll see:
```
output/
├── test_audio_20250623_143022_transcription.md
├── test_audio_20250623_143022_summary.md  
└── test_audio_20250623_143022_analysis.json
```

## ⚡ Common Commands

**Always activate virtual environment first:**
```bash
# Mac/Linux
source audio_env/bin/activate

# Windows  
audio_env\Scripts\activate
```

**Then run commands:**
```bash
# Basic usage
python audio_analyzer.py recording.mp3

# With explicit API key
python audio_analyzer.py meeting.wav --api-key sk-your-key

# Get help
python audio_analyzer.py --help

# Deactivate virtual environment when done
deactivate
```

## 🚨 Troubleshooting

**externally-managed-environment error (Mac)?**
```bash
❌ This environment is externally managed
```
→ Use virtual environment (already covered above!)

**Virtual environment not working?**
```bash
# Make sure you activated it:
source audio_env/bin/activate    # Mac/Linux
audio_env\Scripts\activate       # Windows

# Your prompt should show: (audio_env)
```

**File too large?**
```bash
❌ File too large: 30.5MB
Maximum allowed size: 25MB
```
→ Compress your audio or split into smaller files

**Wrong format?**  
```bash
❌ Unsupported audio format: .txt
```
→ Use: .mp3, .wav, .m4a, .flac, .webm

**API key issues?**
```bash
❌ Error: OpenAI API key required!
```
→ Check your .env file contains the correct API key

---

**Need more help?** Check the full [README.md](README.md) for detailed instructions.