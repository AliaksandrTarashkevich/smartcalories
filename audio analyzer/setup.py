#!/usr/bin/env python3
"""
Setup script for Audio Transcription and Analysis Console Application
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is 3.7 or higher."""
    if sys.version_info < (3, 7):
        print("❌ Error: Python 3.7 or higher is required.")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")

def install_dependencies():
    """Install required Python packages."""
    print("\n📦 Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully!")
    except subprocess.CalledProcessError:
        print("❌ Error installing dependencies. Please install manually:")
        print("pip install openai mutagen")
        sys.exit(1)

def create_directories():
    """Create necessary directories."""
    print("\n📁 Creating directories...")
    Path("output").mkdir(exist_ok=True)
    print("✅ Output directory created!")

def check_env_file():
    """Check and help setup .env file."""
    print("\n🔑 Setting up API key...")
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if env_file.exists():
        print("✅ .env file found!")
        # Check if it has the API key
        try:
            with open(env_file, 'r') as f:
                content = f.read()
                if "your-openai-api-key-here" in content:
                    print("⚠️  Please edit .env file and add your actual API key!")
                    return False
                elif "OPENAI_API_KEY=" in content:
                    print("✅ API key appears to be configured in .env file!")
                    return True
        except Exception:
            pass
    else:
        if env_example.exists():
            print("📝 Creating .env file from .env.example...")
            try:
                with open(env_example, 'r') as src, open(env_file, 'w') as dst:
                    dst.write(src.read())
                print("✅ .env file created!")
                print("⚠️  Please edit .env file and add your actual API key!")
                return False
            except Exception as e:
                print(f"❌ Error creating .env file: {e}")
        else:
            print("⚠️  No .env.example file found. Creating basic .env file...")
            try:
                with open(env_file, 'w') as f:
                    f.write("# OpenAI API Configuration\n")
                    f.write("OPENAI_API_KEY=your-openai-api-key-here\n")
                print("✅ Basic .env file created!")
                print("⚠️  Please edit .env file and add your actual API key!")
                return False
            except Exception as e:
                print(f"❌ Error creating .env file: {e}")
    
    return check_api_key()

def main():
    """Main setup function."""
    print("🚀 Audio Transcription and Analysis Setup")
    print("=" * 50)
    
    # Check Python version
    check_python_version()
    
    # Install dependencies
    install_dependencies()
    
    # Create directories
    create_directories()
    
def check_api_key():
    """Check if OpenAI API key is set."""
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and api_key != "your-openai-api-key-here":
        print("✅ OpenAI API key found!")
        return True
    else:
        print("⚠️  OpenAI API key not properly configured.")
        print("Please set your API key using one of these methods:")
        print("1. Edit .env file and add your API key")
        print("2. Set environment variable: export OPENAI_API_KEY='your-key'")
        print("3. Use --api-key argument when running the application")
        return False

def main():
    """Main setup function."""
    print("🚀 Audio Transcription and Analysis Setup")
    print("=" * 50)
    
    # Check Python version
    check_python_version()
    
    # Install dependencies
    install_dependencies()
    
    # Create directories
    create_directories()
    
    # Check/setup .env file and API key
    api_key_configured = check_env_file()
    
    print("\n" + "=" * 50)
    if api_key_configured:
        print("✅ Setup completed successfully!")
    else:
        print("⚠️  Setup completed, but API key needs configuration!")
    print("=" * 50)
    
    print("\n📖 Next steps:")
    if not api_key_configured:
        print("1. Edit .env file and add your OpenAI API key")
        print("2. Run the application:")
    else:
        print("1. Run the application:")
    print("   python audio_analyzer.py your_audio_file.mp3")
    print("\n📚 For help:")
    print("   python audio_analyzer.py --help")

if __name__ == "__main__":
    main()