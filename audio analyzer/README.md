# Audio Transcription and Analysis Console Application

A powerful Python console application that transcribes audio files using OpenAI's Whisper API, generates summaries using GPT, and provides detailed analytics including word count, speaking speed, and frequently mentioned topics.

## Features

- 🎵 **Audio Transcription**: Uses OpenAI Whisper-1 model for accurate speech-to-text conversion
- 📝 **Smart Summarization**: Generates concise summaries using GPT-4
- 📊 **Detailed Analytics**: Calculates word count, speaking speed (WPM), and extracts key topics
- 💾 **File Management**: Automatically saves transcriptions, summaries, and analytics with timestamps
- 🔄 **Flexible Input**: Supports multiple audio formats (MP3, WAV, M4A, FLAC, etc.)
- 📈 **Console Output**: Clear, formatted results displayed in the terminal

## Requirements

- Python 3.7 or higher
- OpenAI API key
- Internet connection (for API calls)

## Installation

### 1. Clone or Download the Project

Download the project files to your local machine:

```bash
# If using git
git clone <repository-url>
cd audio-analyzer

# Or download and extract the ZIP file
```

### 2. Set Up Virtual Environment (Recommended)

**Why Virtual Environment?** Modern Python installations (especially on macOS via Homebrew) require isolated environments to avoid conflicts.

**Mac/Linux:**
```bash
# Create virtual environment
python3 -m venv audio_env

# Activate it
source audio_env/bin/activate

# Your prompt should now show: (audio_env) $
```

**Windows:**
```bash
# Create virtual environment
python -m venv audio_env

# Activate it
audio_env\Scripts\activate

# Your prompt should now show: (audio_env) >
```

**To deactivate later (optional):**
```bash
deactivate
```

### 3. Install Python Dependencies

**With Virtual Environment Active (recommended):**
```bash
pip install -r requirements.txt
# Or individually:
pip install openai mutagen python-dotenv
```

**Alternative Methods (if you don't use venv):**

**Mac/Linux without venv:**
```bash
# User installation (safer than system-wide)
pip3 install --user -r requirements.txt

# Or with pipx (install pipx first: brew install pipx)
pipx install openai mutagen python-dotenv
```

**Windows without venv:**
```bash
pip install -r requirements.txt
```

### 4. Set Up OpenAI API Key

You need an OpenAI API key to use this application. Get one from [OpenAI Platform](https://platform.openai.com/api-keys).

**Option A: .env File (Recommended - Most Secure)**

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file and add your API key:**
   ```bash
   # Open .env file in your text editor and replace:
   OPENAI_API_KEY=your-actual-openai-api-key-here
   ```

3. **The .env file is automatically ignored by git** (your API key stays private)

**Option B: Environment Variable**

**Mac/Linux (bash/zsh):**
```bash
export OPENAI_API_KEY='your-api-key-here'

# To make it permanent, add to your shell profile:
echo 'export OPENAI_API_KEY="your-api-key-here"' >> ~/.bashrc
# or for zsh:
echo 'export OPENAI_API_KEY="your-api-key-here"' >> ~/.zshrc
```

**Windows:**
```bash
# Command Prompt
set OPENAI_API_KEY=your-api-key-here

# PowerShell
$env:OPENAI_API_KEY="your-api-key-here"

# To make it permanent on Windows:
# 1. Search for "Environment Variables" in Windows
# 2. Click "Environment Variables" button  
# 3. Under "User variables", click "New"
# 4. Variable name: OPENAI_API_KEY
# 5. Variable value: your-api-key-here
```

**Option C: Command Line Argument**
You can pass the API key directly when running the application:
```bash
# All platforms
python audio_analyzer.py audio.mp3 --api-key your-api-key-here
```

⚠️ **Security Note**: The .env file method is most secure as it keeps your API key out of version control and command history.

## Usage

### Basic Usage

**With Virtual Environment (recommended):**
```bash
# Make sure virtual environment is activated first
source audio_env/bin/activate    # Mac/Linux
# audio_env\Scripts\activate     # Windows

# Then run the application
python audio_analyzer.py <audio_file_path>
```

**Without Virtual Environment:**
```bash
# Mac/Linux
python3 audio_analyzer.py <audio_file_path>

# Windows
python audio_analyzer.py <audio_file_path>
```

### Examples

**With Virtual Environment:**
```bash
# Activate environment first
source audio_env/bin/activate

# Then run commands
python audio_analyzer.py recording.mp3
python audio_analyzer.py interview.wav --api-key sk-your-key-here
python audio_analyzer.py presentation.m4a
```

**Without Virtual Environment:**
```bash
# Mac/Linux examples
python3 audio_analyzer.py recording.mp3
python3 audio_analyzer.py interview.wav --api-key sk-your-key-here

# Windows examples  
python audio_analyzer.py recording.mp3
python audio_analyzer.py interview.wav --api-key sk-your-key-here
```

### Command Line Arguments

- `audio_file` (required): Path to the audio file to transcribe and analyze
- `--api-key` (optional): OpenAI API key (if not set as environment variable)

### Help

```bash
# Mac/Linux
python3 audio_analyzer.py --help

# Windows
python audio_analyzer.py --help
```

## Supported Audio Formats and Limits

The application supports all audio formats that OpenAI Whisper API accepts:

### Supported Formats
- **MP3** - Most common format
- **MP4** - Video files (audio will be extracted)
- **MPEG** - MPEG audio format
- **MPGA** - MPEG audio
- **M4A** - Apple audio format
- **WAV** - Uncompressed audio (best quality)
- **WEBM** - Web-optimized format
- **FLAC** - Lossless compression

### File Limits
- **Maximum file size**: 25 MB (OpenAI Whisper API limit)
- **Automatic validation**: The app checks file size and format before processing
- **Quality recommendation**: Use high-quality recordings with minimal background noise

### File Size Guidelines
```bash
# Typical file sizes for 1 hour of audio:
# MP3 (128kbps): ~56 MB ❌ Too large
# MP3 (64kbps):  ~28 MB ❌ Still too large  
# M4A (64kbps):  ~28 MB ❌ Still too large
# For 1-hour files, compress to lower bitrate or split into segments

# Recommended for staying under 25MB:
# ~30-40 minutes of MP3 at 128kbps
# ~60 minutes of MP3 at 64kbps  
# ~20 minutes of WAV (uncompressed)
```

**Tip**: For large files, consider splitting them into smaller segments or compressing the audio.

## Automatic Validation and Error Handling

The application automatically validates your audio files and handles common issues:

### File Validation
✅ **Format Check**: Ensures file format is supported  
✅ **Size Check**: Verifies file is under 25MB limit  
✅ **Existence Check**: Confirms file exists and is accessible

### API Reliability Features  
✅ **Automatic Retries**: Handles rate limits and API errors with smart retry logic  
✅ **Error Recovery**: Exponential backoff for temporary failures (1s, 2s, 4s delays)  
✅ **Clear Error Messages**: Detailed information about what went wrong

### Example Validation Messages
```bash
✓ Audio file validation passed:
  - Format: .mp3
  - Size: 12.3MB

# Or if there are issues:
❌ Unsupported audio format: .txt
Supported formats: .flac, .m4a, .mp3, .mp4, .mpeg, .mpga, .wav, .webm

❌ File too large: 30.5MB
Maximum allowed size: 25MB
```

The application creates three output files for each processed audio file:

1. **`{filename}_{timestamp}_transcription.md`**: Complete transcription in Markdown format
2. **`{filename}_{timestamp}_summary.md`**: AI-generated summary in Markdown format
3. **`{filename}_{timestamp}_analysis.json`**: Detailed analytics in JSON format

All files are saved in the `output/` directory.

### Sample Output Structure

```
output/
├── interview_20241215_143022_transcription.md
├── interview_20241215_143022_summary.md
└── interview_20241215_143022_analysis.json
```

## Analytics Output

The analytics JSON file contains:

```json
{
  "word_count": 1280,
  "speaking_speed_wpm": 132.5,
  "audio_duration_seconds": 580.25,
  "frequently_mentioned_topics": [
    { "topic": "Customer Onboarding", "mentions": 6 },
    { "topic": "Q4 Roadmap", "mentions": 4 },
    { "topic": "AI Integration", "mentions": 3 }
  ]
}
```

## Console Output

The application provides real-time progress updates and displays results in the console:

1. **Progress Indicators**: Shows transcription, summarization, and analysis progress
2. **Analytics Summary**: Displays key metrics
3. **Summary Preview**: Shows the generated summary
4. **Transcription Preview**: Shows first 500 characters of transcription
5. **File Locations**: Lists paths to saved output files

## Error Handling

The application handles various error scenarios:

- **Missing API Key**: Clear instructions on how to set up the API key
- **File Not Found**: Validates audio file existence before processing
- **API Errors**: Handles OpenAI API rate limits and errors gracefully
- **Audio Format Issues**: Reports unsupported formats or corrupted files
- **Network Issues**: Provides clear error messages for connectivity problems

## Troubleshooting

### Platform-Specific Issues

**Mac with Homebrew Python:**
```bash
# Error: externally-managed-environment
# Solution: Use virtual environment (recommended)
python3 -m venv audio_env
source audio_env/bin/activate
pip install -r requirements.txt

# Alternative: User installation
pip3 install --user -r requirements.txt

# Alternative: pipx
brew install pipx
pipx install openai mutagen python-dotenv
```

**Mac/Linux:**
```bash
# If 'python' command not found, use python3
python3 audio_analyzer.py audio.mp3

# Set environment variable (bash/zsh)
export OPENAI_API_KEY='your-api-key-here'
```

**Windows:**
```bash
# Usually 'python' works on Windows
python audio_analyzer.py audio.mp3

# Set environment variable
# Command Prompt:
set OPENAI_API_KEY=your-api-key-here

# PowerShell:
$env:OPENAI_API_KEY="your-api-key-here"
```

### Common Issues

**1. "OpenAI library not installed"**
```bash
# Mac/Linux
pip3 install openai mutagen

# Windows  
pip install openai mutagen
```

**2. "Mutagen library not installed"**
```bash
pip install mutagen
```

**3. "API key required"**
```bash
❌ Error: OpenAI API key required!
```
**Solutions:**
- **Option 1**: Check your .env file exists and contains your API key
- **Option 2**: Set environment variable and restart terminal
- **Option 3**: Use `--api-key` argument:
  ```bash
  python audio_analyzer.py audio.mp3 --api-key sk-your-key-here
  ```
- Verify the API key is valid and has sufficient credits on [OpenAI Platform](https://platform.openai.com/usage)

**4. "Unsupported audio format"**
```bash
❌ Unsupported audio format: .txt
Supported formats: .flac, .m4a, .mp3, .mp4, .mpeg, .mpga, .wav, .webm
```
- Convert your file to a supported format using audio conversion tools

**5. "File too large"**
```bash
❌ File too large: 30.5MB
Maximum allowed size: 25MB
```
- Compress the audio file to reduce size
- Split large files into smaller segments
- Use lower bitrate encoding

**6. "Audio file not found"**
- Check the file path is correct and use quotes for paths with spaces:
  ```bash
  python audio_analyzer.py "path with spaces/audio.mp3"
  ```

### API Rate Limits and Retries

The application automatically handles API issues:
- **Rate limits**: Automatic retry with increasing delays (1s, 2s, 4s)  
- **Network errors**: Smart retry logic for temporary connection issues
- **API errors**: Clear error messages with suggested solutions

If you see retry messages, the app is working normally:
```bash
⚠️ Rate limit hit. Retrying in 2 seconds... (attempt 2/3)
✓ Transcription completed successfully
```

### API Rate Limits

If you encounter rate limit errors:
- Wait a few minutes before retrying
- Consider upgrading your OpenAI plan for higher rate limits

### Audio Quality Tips

For best transcription results:
- **Use clear, high-quality audio recordings**
- **Minimize background noise** and echo
- **Ensure speakers are audible** and not speaking too fast  
- **Use standard languages** supported by Whisper
- **Keep files under 25MB** (automatic validation will warn you)
- **Choose appropriate formats**: WAV for best quality, MP3 for good balance of size/quality

### File Preparation Tips
```bash
# Good file sizes for different durations:
# 5-10 minutes: MP3 at any bitrate ✅
# 15-30 minutes: MP3 at 128kbps or lower ✅  
# 30-45 minutes: MP3 at 64kbps or M4A ✅
# 1+ hour: Split into segments or use very low bitrate ⚠️
```

The application will automatically check your file and provide guidance if issues are detected.

## Dependencies

- **openai**: Official OpenAI Python client for API access
- **mutagen**: Audio file metadata extraction for duration calculation

## License

This project is provided as-is for educational and development purposes.

## API Costs

This application uses OpenAI's paid APIs:
- **Whisper API**: $0.006 per minute of audio
- **GPT-4 API**: Based on token usage

Monitor your usage on the [OpenAI Platform](https://platform.openai.com/usage).

## Support

For issues related to:
- **OpenAI APIs**: Check [OpenAI Documentation](https://platform.openai.com/docs)
- **Audio formats**: Refer to [Whisper API documentation](https://platform.openai.com/docs/guides/speech-to-text)
- **Application bugs**: Check error messages and troubleshooting section above