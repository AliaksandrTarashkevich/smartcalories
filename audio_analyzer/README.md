# Audio Transcription and Analysis Console Application

A powerful Node.js console application that transcribes audio files using OpenAI's Whisper API, generates summaries using GPT, and provides detailed analytics including word count, speaking speed, and frequently mentioned topics.

## Features

- 🎵 **Audio Transcription**: Uses OpenAI Whisper-1 model for accurate speech-to-text conversion
- 📝 **Smart Summarization**: Generates concise summaries using GPT-4
- 📊 **Detailed Analytics**: Calculates word count, speaking speed (WPM), and extracts key topics
- 💾 **File Management**: Automatically saves transcriptions, summaries, and analytics with timestamps
- 🔄 **Flexible Input**: Supports multiple audio formats (MP3, WAV, M4A, FLAC, etc.)
- 📈 **Console Output**: Clear, formatted results displayed in the terminal
- 🔄 **Automatic Retries**: Smart retry logic for API rate limits and errors

## Requirements

- Node.js 16.0.0 or higher
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

### 2. Install Dependencies

Install the required Node.js packages using npm:

```bash
npm install
```

**Dependencies installed:**
- `openai` - Official OpenAI JavaScript SDK
- `music-metadata` - Audio file metadata extraction
- `commander` - Command line interface
- `dotenv` - Environment variable management

### 3. Set Up OpenAI API Key

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
node audio_analyzer.js audio.mp3 --api-key your-api-key-here
```

⚠️ **Security Note**: The .env file method is most secure as it keeps your API key out of version control and command history.

## Usage

### Basic Usage

```bash
node audio_analyzer.js <audio_file_path>
```

### Examples

```bash
# Transcribe a local MP3 file
node audio_analyzer.js recording.mp3

# Transcribe with explicit API key
node audio_analyzer.js interview.wav --api-key sk-your-key-here

# Transcribe different audio formats
node audio_analyzer.js presentation.m4a
node audio_analyzer.js podcast.flac
node audio_analyzer.js meeting.webm
```

### Command Line Arguments

- `audio_file` (required): Path to the audio file to transcribe and analyze
- `--api-key` (optional): OpenAI API key (if not set as environment variable)
- `--help`: Show help information
- `--version`: Show version information

### Help

```bash
node audio_analyzer.js --help
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

## Output Files

The application creates a **dedicated folder for each audio file** with organized results:

### Folder Structure
```
output/
├── meeting_recording/
│   ├── transcription.md
│   ├── summary.md
│   └── analysis.json
├── interview_session/
│   ├── transcription.md
│   ├── summary.md
│   └── analysis.json
└── podcast_episode/
    ├── transcription.md
    ├── summary.md
    └── analysis.json
```

### File Organization
- **Each audio file gets its own folder** named after the original filename
- **Simple, clean filenames** within each folder (no timestamps in names)
- **Duplicate handling**: If you process the same filename twice, folders get numbered (`filename_1`, `filename_2`, etc.)

### File Contents
1. **`transcription.md`**: Complete transcription in Markdown format with metadata
2. **`summary.md`**: AI-generated summary in Markdown format with metadata  
3. **`analysis.json`**: Detailed analytics in JSON format with processing metadata

### Sample Output Structure

```
output/
└── my_meeting/
    ├── transcription.md      # Full transcription
    ├── summary.md           # AI summary
    └── analysis.json        # Analytics + metadata
```

### Metadata Included
Each file contains processing metadata:
- **Original filename**
- **Processing date/time** 
- **Processing ID** (timestamp)
- **Output folder name**

## Analytics Output

The analytics JSON file contains comprehensive data and metadata:

```json
{
  "word_count": 1280,
  "speaking_speed_wpm": 132.5,
  "audio_duration_seconds": 580.25,
  "frequently_mentioned_topics": [
    { "topic": "Customer Onboarding", "mentions": 6 },
    { "topic": "Q4 Roadmap", "mentions": 4 },
    { "topic": "AI Integration", "mentions": 3 }
  ],
  "metadata": {
    "original_filename": "my_meeting.mp3",
    "processed_date": "2025-06-23T14:30:22.123Z",
    "processing_id": "2025-06-23_143022",
    "output_folder": "my_meeting"
  }
}
```

### Analytics Data
- **`word_count`**: Total number of words in transcription
- **`speaking_speed_wpm`**: Words per minute (calculated from duration)
- **`audio_duration_seconds`**: Length of audio file in seconds
- **`frequently_mentioned_topics`**: Top topics with mention counts

### Metadata
- **`original_filename`**: Name of the processed audio file
- **`processed_date`**: ISO timestamp of when processing completed
- **`processing_id`**: Unique identifier for this processing session
- **`output_folder`**: Name of the folder containing results

## Console Output

The application provides real-time progress updates and displays results in the console:

1. **Progress Indicators**: Shows transcription, summarization, and analysis progress
2. **Analytics Summary**: Displays key metrics
3. **Summary Preview**: Shows the generated summary
4. **Transcription Preview**: Shows first 500 characters of transcription
5. **File Locations**: Lists paths to saved output files

## NPM Scripts

The package includes several convenient npm scripts:

```bash
# Run the application
npm start <audio_file>

# Show help
npm test

# Run setup script (if available)
npm run setup

# Development mode with auto-restart
npm run dev <audio_file>
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up API key (choose one method):**
   ```bash
   # Method 1: .env file (recommended)
   cp .env.example .env
   # Then edit .env and add your API key
   
   # Method 2: Environment variable
   export OPENAI_API_KEY='your-api-key-here'
   ```

3. **Run the application:**
   ```bash
   node audio_analyzer.js your_audio.mp3
   ```

## Error Handling

The application handles various error scenarios:

- **Missing API Key**: Clear instructions on how to set up the API key
- **File Not Found**: Validates audio file existence before processing
- **API Errors**: Handles OpenAI API rate limits and errors gracefully
- **Audio Format Issues**: Reports unsupported formats or corrupted files
- **Network Issues**: Provides clear error messages for connectivity problems

## Troubleshooting

### Common Issues

**1. "OpenAI library not installed"**
```bash
npm install openai
```

**2. "music-metadata library not installed"**
```bash
npm install music-metadata
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
  node audio_analyzer.js audio.mp3 --api-key sk-your-key-here
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
  node audio_analyzer.js "path with spaces/audio.mp3"
  ```

**7. Node.js version issues**
```bash
# Check your Node.js version
node --version

# Should be 16.0.0 or higher
# Update Node.js if needed from: https://nodejs.org/
```

### API Rate Limits and Retries

The application automatically handles API issues:
- **Rate limits**: Automatic retry with increasing delays (1s, 2s, 4s)  
- **Network errors**: Smart retry logic for temporary connection issues
- **API errors**: Clear error messages with suggested solutions

If you see retry messages, the app is working normally:
```bash
⚠️ Rate limit exceeded. Retrying in 2 seconds... (attempt 2/3)
✓ Transcription completed successfully
```

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

- **openai**: Official OpenAI JavaScript client for API access
- **music-metadata**: Audio file metadata extraction for duration calculation
- **commander**: Command line interface framework
- **dotenv**: Environment variable management

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
- **Node.js issues**: Ensure you're using Node.js 16.0.0 or higher
- **Application bugs**: Check error messages and troubleshooting section above