# Quick Start Guide (JavaScript/Node.js)

## 📦 1-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure API Key
```bash
# Copy the example file
cp .env.example .env

# Edit .env file and replace with your actual API key
# OPENAI_API_KEY=your-actual-openai-api-key-here
```

### Step 3: Run the Application
```bash
node audio_analyzer.js your_audio.mp3
```

## 🔧 Automatic Setup Script

Run the setup script for guided installation:

```bash
npm run setup
```

This will:
- ✅ Check Node.js version
- ✅ Install dependencies  
- ✅ Create output directory
- ✅ Set up .env file
- ✅ Verify API key configuration

## 🎵 Test with Sample Audio

1. **Record a short audio** (or download any MP3/WAV file)
2. **Place it in the project directory**  
3. **Run the analyzer:**
   ```bash
   node audio_analyzer.js test_audio.mp3
   ```

## 📁 Expected Output

After processing, you'll see an organized folder structure:
```
output/
└── test_audio/
    ├── transcription.md      # Complete transcription
    ├── summary.md           # AI-generated summary
    └── analysis.json        # Analytics with metadata
```

### Benefits of This Structure:
✅ **Easy to find** - each audio file has its own folder  
✅ **Clean filenames** - no timestamps cluttering names  
✅ **Organized** - transcription, summary, and analysis together  
✅ **Scalable** - can process many files without mess  
✅ **Duplicate safe** - handles same filenames automatically (test_audio_1, test_audio_2, etc.)

## ⚡ Common Commands

```bash
# Basic usage
node audio_analyzer.js recording.mp3

# With explicit API key
node audio_analyzer.js meeting.wav --api-key sk-your-key

# Get help
node audio_analyzer.js --help

# Check version
node audio_analyzer.js --version

# Use npm scripts
npm start recording.mp3
npm test  # Shows help
```

## 🚨 Troubleshooting

**Node.js version too old?**
```bash
❌ Error: Node.js 16.0.0 or higher required
```
→ Update Node.js from [nodejs.org](https://nodejs.org/)

**Dependencies not installed?**
```bash
❌ Cannot find module 'openai'
```
→ Run: `npm install`

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

## 📋 Requirements Check

**Minimum Requirements:**
- ✅ Node.js 16.0.0+ 
- ✅ OpenAI API key
- ✅ Internet connection

**Check your setup:**
```bash
# Check Node.js version
node --version

# Check npm version  
npm --version

# Test dependencies
npm list openai music-metadata
```

## 🎯 Advantages over Python version

✅ **No virtual environment** needed  
✅ **Simpler installation** - just `npm install`  
✅ **Native audio metadata** - no external tools required  
✅ **Familiar for JavaScript developers**  
✅ **Cross-platform** - works on Mac/Windows/Linux  

---

**Need more help?** Check the full [README.md](README.md) for detailed instructions.