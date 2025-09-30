#!/usr/bin/env python3
"""
Audio Transcription and Analysis Console Application

This application transcribes audio files using OpenAI's Whisper API,
summarizes the content using GPT, and provides detailed analytics.
"""

import os
import json
import argparse
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Any
import re

# Third-party imports
try:
    import openai
    from openai import OpenAI, RateLimitError, APIError, APIConnectionError
except ImportError:
    print("Error: OpenAI library not installed. Please run: pip install openai")
    sys.exit(1)

try:
    from mutagen import File as MutagenFile
except ImportError:
    print("Error: Mutagen library not installed. Please run: pip install mutagen")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    # Load environment variables from .env file if it exists
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not installed. Using system environment variables only.")
    print("For easier setup, install with: pip install python-dotenv")


# Constants for audio file validation
SUPPORTED_AUDIO_FORMATS = {'.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm', '.flac'}
MAX_FILE_SIZE_MB = 25
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


class AudioAnalyzer:
    """Main class for audio transcription and analysis."""
    
    def __init__(self, api_key: str):
        """Initialize the AudioAnalyzer with OpenAI API key."""
        self.client = OpenAI(api_key=api_key)
        self.output_dir = Path("output")
        self.output_dir.mkdir(exist_ok=True)
    
    def validate_audio_file(self, audio_path: str) -> None:
        """Validate audio file format and size."""
        audio_file = Path(audio_path)
        
        # Check if file exists
        if not audio_file.exists():
            raise FileNotFoundError(f"Audio file not found: {audio_path}")
        
        # Check file format
        file_extension = audio_file.suffix.lower()
        if file_extension not in SUPPORTED_AUDIO_FORMATS:
            raise ValueError(
                f"Unsupported audio format: {file_extension}\n"
                f"Supported formats: {', '.join(sorted(SUPPORTED_AUDIO_FORMATS))}"
            )
        
        # Check file size
        file_size = audio_file.stat().st_size
        file_size_mb = file_size / (1024 * 1024)
        if file_size > MAX_FILE_SIZE_BYTES:
            raise ValueError(
                f"File too large: {file_size_mb:.1f}MB\n"
                f"Maximum allowed size: {MAX_FILE_SIZE_MB}MB"
            )
        
        print(f"✓ Audio file validation passed:")
        print(f"  - Format: {file_extension}")
        print(f"  - Size: {file_size_mb:.1f}MB")
    
    def get_audio_duration(self, audio_path: str) -> float:
        """Get audio duration in seconds using mutagen."""
        try:
            audio_file = MutagenFile(audio_path)
            if audio_file is not None and hasattr(audio_file, 'info'):
                return float(audio_file.info.length)
            else:
                print(f"Warning: Could not determine audio duration for {audio_path}")
                return 0.0
        except Exception as e:
            print(f"Warning: Error getting audio duration: {e}")
            return 0.0
    
    def transcribe_audio(self, audio_path: str) -> str:
        """Transcribe audio using OpenAI Whisper API with retry logic."""
        print(f"Transcribing audio file: {audio_path}")
        
        max_retries = 3
        base_delay = 1  # Base delay in seconds
        
        for attempt in range(max_retries):
            try:
                with open(audio_path, "rb") as audio_file:
                    transcript = self.client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        response_format="text"
                    )
                print("✓ Transcription completed successfully")
                return transcript
                
            except RateLimitError as e:
                if attempt == max_retries - 1:
                    raise Exception(f"Rate limit exceeded after {max_retries} attempts: {e}")
                
                delay = base_delay * (2 ** attempt)  # Exponential backoff
                print(f"⚠️  Rate limit hit. Retrying in {delay} seconds... (attempt {attempt + 1}/{max_retries})")
                time.sleep(delay)
                
            except (APIError, APIConnectionError) as e:
                if attempt == max_retries - 1:
                    raise Exception(f"API error after {max_retries} attempts: {e}")
                
                delay = base_delay * (2 ** attempt)
                print(f"⚠️  API error. Retrying in {delay} seconds... (attempt {attempt + 1}/{max_retries})")
                time.sleep(delay)
                
            except Exception as e:
                print(f"Error during transcription: {e}")
                raise
    
    def summarize_text(self, text: str) -> str:
        """Summarize text using OpenAI GPT model."""
        print("Generating summary...")
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that creates concise, informative summaries of transcribed audio content. Focus on key points, main topics, and important details."
                    },
                    {
                        "role": "user",
                        "content": f"Please provide a comprehensive summary of the following transcribed audio content:\n\n{text}"
                    }
                ],
                max_tokens=1000,
                temperature=0.3
            )
            summary = response.choices[0].message.content
            print("✓ Summary generated successfully")
            return summary
        except Exception as e:
            print(f"Error during summarization: {e}")
            raise
    
    def extract_topics(self, text: str) -> List[Dict[str, Any]]:
        """Extract frequently mentioned topics using GPT."""
        print("Extracting topics...")
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert at analyzing text and identifying key topics and themes. 
                        Return a JSON array of the most frequently mentioned topics with their mention counts.
                        Each item should have 'topic' and 'mentions' fields.
                        Focus on meaningful topics, not common words like 'the', 'and', etc.
                        Return at least 3 topics, more if there are significant ones."""
                    },
                    {
                        "role": "user", 
                        "content": f"Analyze this transcribed audio content and identify the most frequently mentioned topics with their approximate mention counts:\n\n{text}\n\nReturn only a JSON array in this format: " + '[{"topic": "Topic Name", "mentions": 5}]'
                    }
                ],
                max_tokens=500,
                temperature=0.1
            )
            
            topics_text = response.choices[0].message.content
            # Extract JSON from the response
            json_match = re.search(r'\[.*\]', topics_text, re.DOTALL)
            if json_match:
                topics = json.loads(json_match.group())
            else:
                # Fallback: try to parse the entire response as JSON
                topics = json.loads(topics_text)
            
            print("✓ Topics extracted successfully")
            return topics
        except Exception as e:
            print(f"Warning: Error extracting topics with GPT: {e}")
            # Fallback to simple keyword extraction
            return self._simple_topic_extraction(text)
    
    def _simple_topic_extraction(self, text: str) -> List[Dict[str, Any]]:
        """Fallback simple topic extraction based on word frequency."""
        print("Using fallback topic extraction...")
        
        # Clean and split text
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Common stop words to filter out
        stop_words = {
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
            'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i',
            'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
            'my', 'your', 'his', 'her', 'its', 'our', 'their', 'a', 'an', 'some',
            'any', 'all', 'each', 'every', 'no', 'not', 'very', 'so', 'just', 'now',
            'then', 'than', 'only', 'also', 'back', 'other', 'many', 'much', 'more',
            'most', 'good', 'new', 'first', 'last', 'long', 'great', 'little', 'own',
            'same', 'right', 'big', 'high', 'different', 'small', 'large', 'next',
            'early', 'young', 'important', 'few', 'public', 'bad', 'same', 'able'
        }
        
        # Count word frequencies
        word_counts = {}
        for word in words:
            if word not in stop_words and len(word) > 3:
                word_counts[word] = word_counts.get(word, 0) + 1
        
        # Get top topics
        sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
        topics = [{"topic": word.title(), "mentions": count} for word, count in sorted_words[:5]]
        
        return topics
    
    def calculate_analytics(self, text: str, audio_duration: float) -> Dict[str, Any]:
        """Calculate comprehensive analytics for the transcribed text."""
        print("Calculating analytics...")
        
        # Word count
        words = text.split()
        word_count = len(words)
        
        # Speaking speed (WPM)
        if audio_duration > 0:
            duration_minutes = audio_duration / 60
            speaking_speed = round(word_count / duration_minutes, 1)
        else:
            speaking_speed = 0
        
        # Extract topics
        topics = self.extract_topics(text)
        
        analytics = {
            "word_count": word_count,
            "speaking_speed_wpm": speaking_speed,
            "audio_duration_seconds": round(audio_duration, 2),
            "frequently_mentioned_topics": topics
        }
        
        print("✓ Analytics calculated successfully")
        return analytics
    
    def save_files(self, transcription: str, summary: str, analytics: Dict[str, Any], 
                   original_filename: str) -> Tuple[str, str, str]:
        """Save transcription, summary, and analytics to separate files."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = Path(original_filename).stem
        
        # File paths
        transcription_path = self.output_dir / f"{base_name}_{timestamp}_transcription.md"
        summary_path = self.output_dir / f"{base_name}_{timestamp}_summary.md"
        analytics_path = self.output_dir / f"{base_name}_{timestamp}_analysis.json"
        
        # Save transcription
        with open(transcription_path, 'w', encoding='utf-8') as f:
            f.write(f"# Transcription\n\n")
            f.write(f"**File:** {original_filename}\n")
            f.write(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"## Content\n\n{transcription}\n")
        
        # Save summary
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write(f"# Summary\n\n")
            f.write(f"**File:** {original_filename}\n")
            f.write(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"## Summary\n\n{summary}\n")
        
        # Save analytics
        with open(analytics_path, 'w', encoding='utf-8') as f:
            json.dump(analytics, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Files saved:")
        print(f"  - Transcription: {transcription_path}")
        print(f"  - Summary: {summary_path}")
        print(f"  - Analytics: {analytics_path}")
        
        return str(transcription_path), str(summary_path), str(analytics_path)
    
    def process_audio(self, audio_path: str) -> None:
        """Main method to process audio file completely."""
        print(f"\n{'='*60}")
        print(f"AUDIO TRANSCRIPTION AND ANALYSIS")
        print(f"{'='*60}")
        print(f"Processing: {audio_path}")
        print(f"{'='*60}\n")
        
        try:
            # Validate audio file (format, size, existence)
            self.validate_audio_file(audio_path)
            
            # Get audio duration
            audio_duration = self.get_audio_duration(audio_path)
            print(f"Audio duration: {audio_duration:.2f} seconds\n")
            
            # Step 1: Transcribe audio
            transcription = self.transcribe_audio(audio_path)
            
            # Step 2: Generate summary
            summary = self.summarize_text(transcription)
            
            # Step 3: Calculate analytics
            analytics = self.calculate_analytics(transcription, audio_duration)
            
            # Step 4: Save files
            trans_path, summ_path, anal_path = self.save_files(
                transcription, summary, analytics, os.path.basename(audio_path)
            )
            
            # Step 5: Display results
            self.display_results(transcription, summary, analytics)
            
        except Exception as e:
            print(f"❌ Error processing audio: {e}")
            sys.exit(1)
    
    def display_results(self, transcription: str, summary: str, analytics: Dict[str, Any]) -> None:
        """Display results in the console."""
        print(f"\n{'='*60}")
        print("RESULTS")
        print(f"{'='*60}")
        
        print(f"\n📊 ANALYTICS:")
        print(f"{'='*30}")
        print(json.dumps(analytics, indent=2, ensure_ascii=False))
        
        print(f"\n📝 SUMMARY:")
        print(f"{'='*30}")
        print(summary)
        
        print(f"\n📄 TRANSCRIPTION (first 500 chars):")
        print(f"{'='*30}")
        print(transcription[:500] + ("..." if len(transcription) > 500 else ""))
        
        print(f"\n{'='*60}")
        print("✅ Processing completed successfully!")
        print(f"{'='*60}")


def main():
    """Main function to handle command line arguments and run the application."""
    parser = argparse.ArgumentParser(
        description="Audio Transcription and Analysis Tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python audio_analyzer.py audio.mp3
  python audio_analyzer.py /path/to/audio.wav
  python audio_analyzer.py recording.m4a --api-key YOUR_API_KEY
        """
    )
    
    parser.add_argument(
        "audio_file",
        help="Path to the audio file to transcribe and analyze"
    )
    
    parser.add_argument(
        "--api-key",
        help="OpenAI API key (can also be set via OPENAI_API_KEY environment variable)"
    )
    
    args = parser.parse_args()
    
    # Get API key
    api_key = args.api_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ Error: OpenAI API key required!")
        print("Set it via:")
        print("  - Environment variable: export OPENAI_API_KEY='your-key-here'")
        print("  - Command line argument: --api-key YOUR_KEY")
        sys.exit(1)
    
    # Validate audio file
    if not os.path.exists(args.audio_file):
        print(f"❌ Error: Audio file not found: {args.audio_file}")
        sys.exit(1)
    
    # Process audio
    analyzer = AudioAnalyzer(api_key)
    analyzer.process_audio(args.audio_file)


if __name__ == "__main__":
    main()