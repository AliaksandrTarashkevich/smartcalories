#!/usr/bin/env node

/**
 * Audio Transcription and Analysis Console Application
 * 
 * This application transcribes audio files using OpenAI's Whisper API,
 * summarizes the content using GPT, and provides detailed analytics.
 */

const fs = require('fs').promises;
const path = require('path');
const { program } = require('commander');
require('dotenv').config();

// Third-party imports with error handling
let OpenAI, musicMetadata;
try {
    OpenAI = require('openai');
} catch (error) {
    console.error('Error: OpenAI library not installed. Please run: npm install openai');
    process.exit(1);
}

try {
    musicMetadata = require('music-metadata');
} catch (error) {
    console.error('Error: music-metadata library not installed. Please run: npm install music-metadata');
    process.exit(1);
}

// Constants for audio file validation
const SUPPORTED_AUDIO_FORMATS = new Set(['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm', '.flac']);
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Main class for audio transcription and analysis
 */
class AudioAnalyzer {
    constructor(apiKey) {
        this.client = new OpenAI({ apiKey });
        this.outputDir = path.join(process.cwd(), 'output');
        this.ensureOutputDir();
    }

    /**
     * Ensure output directory exists
     */
    async ensureOutputDir() {
        try {
            await fs.mkdir(this.outputDir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }

    /**
     * Validate audio file format and size
     */
    async validateAudioFile(audioPath) {
        // Check if file exists
        try {
            await fs.access(audioPath);
        } catch (error) {
            throw new Error(`Audio file not found: ${audioPath}`);
        }

        const audioFile = path.parse(audioPath);
        const fileExtension = audioFile.ext.toLowerCase();

        // Check file format
        if (!SUPPORTED_AUDIO_FORMATS.has(fileExtension)) {
            const supportedFormats = Array.from(SUPPORTED_AUDIO_FORMATS).sort().join(', ');
            throw new Error(
                `Unsupported audio format: ${fileExtension}\n` +
                `Supported formats: ${supportedFormats}`
            );
        }

        // Check file size
        const stats = await fs.stat(audioPath);
        const fileSizeMB = stats.size / (1024 * 1024);
        
        if (stats.size > MAX_FILE_SIZE_BYTES) {
            throw new Error(
                `File too large: ${fileSizeMB.toFixed(1)}MB\n` +
                `Maximum allowed size: ${MAX_FILE_SIZE_MB}MB`
            );
        }

        console.log('✓ Audio file validation passed:');
        console.log(`  - Format: ${fileExtension}`);
        console.log(`  - Size: ${fileSizeMB.toFixed(1)}MB`);
    }

    /**
     * Get audio duration in seconds using music-metadata
     */
    async getAudioDuration(audioPath) {
        try {
            const metadata = await musicMetadata.parseFile(audioPath);
            const duration = metadata.format.duration || 0;
            return duration;
        } catch (error) {
            console.warn(`Warning: Could not determine audio duration: ${error.message}`);
            return 0.0;
        }
    }

    /**
     * Transcribe audio using OpenAI Whisper API with retry logic
     */
    async transcribeAudio(audioPath) {
        console.log(`Transcribing audio file: ${audioPath}`);
        
        const maxRetries = 3;
        const baseDelay = 1000; // Base delay in milliseconds
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const audioBuffer = await fs.readFile(audioPath);
                const audioFile = new File([audioBuffer], path.basename(audioPath), {
                    type: this.getMimeType(path.extname(audioPath))
                });

                const transcript = await this.client.audio.transcriptions.create({
                    model: 'whisper-1',
                    file: audioFile,
                    response_format: 'text'
                });

                console.log('✓ Transcription completed successfully');
                return transcript;
                
            } catch (error) {
                if (this.isRetryableError(error) && attempt < maxRetries - 1) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    console.warn(`⚠️  ${error.message}. Retrying in ${delay/1000} seconds... (attempt ${attempt + 1}/${maxRetries})`);
                    await this.sleep(delay);
                } else {
                    throw new Error(`Transcription failed after ${maxRetries} attempts: ${error.message}`);
                }
            }
        }
    }

    /**
     * Check if error is retryable
     */
    isRetryableError(error) {
        const retryableErrors = ['rate_limit_exceeded', 'api_error', 'connection_error', 'timeout'];
        return retryableErrors.some(type => 
            error.message.toLowerCase().includes(type) || 
            error.code === 'rate_limit_exceeded' ||
            error.status >= 500
        );
    }

    /**
     * Get MIME type for audio file extension
     */
    getMimeType(extension) {
        const mimeTypes = {
            '.mp3': 'audio/mpeg',
            '.mp4': 'audio/mp4',
            '.mpeg': 'audio/mpeg',
            '.mpga': 'audio/mpeg',
            '.m4a': 'audio/mp4',
            '.wav': 'audio/wav',
            '.webm': 'audio/webm',
            '.flac': 'audio/flac'
        };
        return mimeTypes[extension.toLowerCase()] || 'audio/mpeg';
    }

    /**
     * Sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Summarize text using OpenAI GPT model
     */
    async summarizeText(text) {
        console.log('Generating summary...');
        
        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that creates concise, informative summaries of transcribed audio content. Focus on key points, main topics, and important details.'
                    },
                    {
                        role: 'user',
                        content: `Please provide a comprehensive summary of the following transcribed audio content:\n\n${text}`
                    }
                ],
                max_tokens: 1000,
                temperature: 0.3
            });
            
            const summary = response.choices[0].message.content;
            console.log('✓ Summary generated successfully');
            return summary;
        } catch (error) {
            throw new Error(`Summary generation failed: ${error.message}`);
        }
    }

    /**
     * Extract frequently mentioned topics using GPT
     */
    async extractTopics(text) {
        console.log('Extracting topics...');
        
        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert at analyzing text and identifying key topics and themes.
                        Return a JSON array of the most frequently mentioned topics with their mention counts.
                        Each item should have 'topic' and 'mentions' fields.
                        Focus on meaningful topics, not common words like 'the', 'and', etc.
                        Return at least 3 topics, more if there are significant ones.`
                    },
                    {
                        role: 'user',
                        content: `Analyze this transcribed audio content and identify the most frequently mentioned topics with their approximate mention counts:\n\n${text}\n\nReturn only a JSON array in this format: ` + '[{"topic": "Topic Name", "mentions": 5}]'
                    }
                ],
                max_tokens: 500,
                temperature: 0.1
            });
            
            const topicsText = response.choices[0].message.content;
            // Extract JSON from the response
            const jsonMatch = topicsText.match(/\[.*\]/s);
            let topics;
            
            if (jsonMatch) {
                topics = JSON.parse(jsonMatch[0]);
            } else {
                // Fallback: try to parse the entire response as JSON
                topics = JSON.parse(topicsText);
            }
            
            console.log('✓ Topics extracted successfully');
            return topics;
        } catch (error) {
            console.warn(`Warning: Error extracting topics with GPT: ${error.message}`);
            // Fallback to simple topic extraction
            return this.simpleTopicExtraction(text);
        }
    }

    /**
     * Fallback simple topic extraction based on word frequency
     */
    simpleTopicExtraction(text) {
        console.log('Using fallback topic extraction...');
        
        // Clean and split text
        const words = text.toLowerCase().match(/\b[a-zA-Z]{3,}\b/g) || [];
        
        // Common stop words to filter out
        const stopWords = new Set([
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
        ]);
        
        // Count word frequencies
        const wordCounts = {};
        words.forEach(word => {
            if (!stopWords.has(word) && word.length > 3) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
        });
        
        // Get top topics
        const sortedWords = Object.entries(wordCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        return sortedWords.map(([word, count]) => ({
            topic: word.charAt(0).toUpperCase() + word.slice(1),
            mentions: count
        }));
    }

    /**
     * Calculate comprehensive analytics for the transcribed text
     */
    async calculateAnalytics(text, audioDuration) {
        console.log('Calculating analytics...');
        
        // Word count
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        
        // Speaking speed (WPM)
        let speakingSpeed = 0;
        if (audioDuration > 0) {
            const durationMinutes = audioDuration / 60;
            speakingSpeed = Math.round((wordCount / durationMinutes) * 10) / 10;
        }
        
        // Extract topics
        const topics = await this.extractTopics(text);
        
        const analytics = {
            word_count: wordCount,
            speaking_speed_wpm: speakingSpeed,
            audio_duration_seconds: Math.round(audioDuration * 100) / 100,
            frequently_mentioned_topics: topics
        };
        
        console.log('✓ Analytics calculated successfully');
        return analytics;
    }

    /**
     * Save transcription, summary, and analytics to separate files
     */
    async saveFiles(transcription, summary, analytics, originalFilename) {
        const baseName = path.parse(originalFilename).name;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                         new Date().toTimeString().split(' ')[0].replace(/:/g, '');
        
        // Create a folder for this audio file
        let audioFolderName = baseName;
        let audioFolderPath = path.join(this.outputDir, audioFolderName);
        
        // Handle duplicate folder names by adding a number
        let counter = 1;
        while (true) {
            try {
                await fs.access(audioFolderPath);
                // Folder exists, try with counter
                audioFolderName = `${baseName}_${counter}`;
                audioFolderPath = path.join(this.outputDir, audioFolderName);
                counter++;
            } catch (error) {
                // Folder doesn't exist, we can use this name
                break;
            }
        }
        
        // Create the audio-specific folder
        await fs.mkdir(audioFolderPath, { recursive: true });
        
        // File paths (simple names within the folder)
        const transcriptionPath = path.join(audioFolderPath, 'transcription.md');
        const summaryPath = path.join(audioFolderPath, 'summary.md');
        const analyticsPath = path.join(audioFolderPath, 'analysis.json');
        
        // Save transcription
        const transcriptionContent = `# Transcription\n\n` +
            `**File:** ${originalFilename}\n` +
            `**Date:** ${new Date().toLocaleString()}\n` +
            `**Processing ID:** ${timestamp}\n\n` +
            `## Content\n\n${transcription}\n`;
        await fs.writeFile(transcriptionPath, transcriptionContent, 'utf8');
        
        // Save summary
        const summaryContent = `# Summary\n\n` +
            `**File:** ${originalFilename}\n` +
            `**Date:** ${new Date().toLocaleString()}\n` +
            `**Processing ID:** ${timestamp}\n\n` +
            `## Summary\n\n${summary}\n`;
        await fs.writeFile(summaryPath, summaryContent, 'utf8');
        
        // Add metadata to analytics
        const analyticsWithMeta = {
            ...analytics,
            metadata: {
                original_filename: originalFilename,
                processed_date: new Date().toISOString(),
                processing_id: timestamp,
                output_folder: audioFolderName
            }
        };
        await fs.writeFile(analyticsPath, JSON.stringify(analyticsWithMeta, null, 2), 'utf8');
        
        console.log('✓ Files saved:');
        console.log(`  - Folder: ${audioFolderPath}`);
        console.log(`  - Transcription: ${transcriptionPath}`);
        console.log(`  - Summary: ${summaryPath}`);
        console.log(`  - Analytics: ${analyticsPath}`);
        
        return { 
            folderPath: audioFolderPath,
            transcriptionPath, 
            summaryPath, 
            analyticsPath 
        };
    }

    /**
     * Main method to process audio file completely
     */
    async processAudio(audioPath) {
        console.log('\n' + '='.repeat(60));
        console.log('AUDIO TRANSCRIPTION AND ANALYSIS');
        console.log('='.repeat(60));
        console.log(`Processing: ${audioPath}`);
        console.log('='.repeat(60) + '\n');
        
        try {
            // Validate audio file (format, size, existence)
            await this.validateAudioFile(audioPath);
            
            // Get audio duration
            const audioDuration = await this.getAudioDuration(audioPath);
            console.log(`Audio duration: ${audioDuration.toFixed(2)} seconds\n`);
            
            // Step 1: Transcribe audio
            const transcription = await this.transcribeAudio(audioPath);
            
            // Step 2: Generate summary
            const summary = await this.summarizeText(transcription);
            
            // Step 3: Calculate analytics
            const analytics = await this.calculateAnalytics(transcription, audioDuration);
            
            // Step 4: Save files
            await this.saveFiles(transcription, summary, analytics, path.basename(audioPath));
            
            // Step 5: Display results
            this.displayResults(transcription, summary, analytics);
            
        } catch (error) {
            console.error(`❌ Error processing audio: ${error.message}`);
            process.exit(1);
        }
    }

    /**
     * Display results in the console
     */
    displayResults(transcription, summary, analytics) {
        console.log('\n' + '='.repeat(60));
        console.log('RESULTS');
        console.log('='.repeat(60));
        
        console.log('\n📊 ANALYTICS:');
        console.log('='.repeat(30));
        console.log(JSON.stringify(analytics, null, 2));
        
        console.log('\n📝 SUMMARY:');
        console.log('='.repeat(30));
        console.log(summary);
        
        console.log('\n📄 TRANSCRIPTION (first 500 chars):');
        console.log('='.repeat(30));
        const truncatedTranscription = transcription.length > 500 
            ? transcription.substring(0, 500) + '...'
            : transcription;
        console.log(truncatedTranscription);
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ Processing completed successfully!');
        console.log('='.repeat(60));
    }
}

/**
 * Main function to handle command line arguments and run the application
 */
async function main() {
    program
        .name('audio-analyzer')
        .description('Audio Transcription and Analysis Tool')
        .version('1.0.0')
        .argument('<audio_file>', 'Path to the audio file to transcribe and analyze')
        .option('--api-key <key>', 'OpenAI API key (can also be set via OPENAI_API_KEY environment variable)')
        .action(async (audioFile, options) => {
            // Get API key
            const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
            if (!apiKey) {
                console.error('❌ Error: OpenAI API key required!');
                console.error('Set it via:');
                console.error('  - Environment variable: export OPENAI_API_KEY="your-key-here"');
                console.error('  - Command line argument: --api-key YOUR_KEY');
                process.exit(1);
            }
            
            // Validate audio file exists
            try {
                await fs.access(audioFile);
            } catch (error) {
                console.error(`❌ Error: Audio file not found: ${audioFile}`);
                process.exit(1);
            }
            
            // Process audio
            const analyzer = new AudioAnalyzer(apiKey);
            await analyzer.processAudio(audioFile);
        });

    program.parse();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled error:', error.message);
    process.exit(1);
});

// Run the application
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Application error:', error.message);
        process.exit(1);
    });
}

module.exports = { AudioAnalyzer };