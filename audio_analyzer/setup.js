#!/usr/bin/env node

/**
 * Setup script for Audio Transcription and Analysis Console Application (JavaScript)
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

/**
 * Check if Node.js version is 16.0.0 or higher
 */
function checkNodeVersion() {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
    
    if (majorVersion < 16) {
        console.error('❌ Error: Node.js 16.0.0 or higher is required.');
        console.error(`Current version: ${nodeVersion}`);
        console.error('Please update Node.js from: https://nodejs.org/');
        process.exit(1);
    }
    console.log(`✅ Node.js version: ${nodeVersion}`);
}

/**
 * Install dependencies
 */
function installDependencies() {
    console.log('\n📦 Installing dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed successfully!');
    } catch (error) {
        console.error('❌ Error installing dependencies. Please install manually:');
        console.error('npm install');
        process.exit(1);
    }
}

/**
 * Create necessary directories
 */
async function createDirectories() {
    console.log('\n📁 Creating directories...');
    try {
        await fs.mkdir('output', { recursive: true });
        console.log('✅ Output directory created!');
    } catch (error) {
        console.error('❌ Error creating directories:', error.message);
        process.exit(1);
    }
}

/**
 * Check and help setup .env file
 */
async function checkEnvFile() {
    console.log('\n🔑 Setting up API key...');
    
    const envFile = '.env';
    const envExample = '.env.example';
    
    try {
        // Check if .env exists
        try {
            const envContent = await fs.readFile(envFile, 'utf8');
            
            if (envContent.includes('your-openai-api-key-here')) {
                console.log('⚠️  Please edit .env file and add your actual API key!');
                return false;
            } else if (envContent.includes('OPENAI_API_KEY=')) {
                console.log('✅ API key appears to be configured in .env file!');
                return checkApiKey();
            }
        } catch (error) {
            // .env doesn't exist, create it
            try {
                await fs.access(envExample);
                const exampleContent = await fs.readFile(envExample, 'utf8');
                await fs.writeFile(envFile, exampleContent);
                console.log('📝 .env file created from .env.example');
                console.log('⚠️  Please edit .env file and add your actual API key!');
                return false;
            } catch (exampleError) {
                // Create basic .env file
                const basicEnv = '# OpenAI API Configuration\nOPENAI_API_KEY=your-openai-api-key-here\n';
                await fs.writeFile(envFile, basicEnv);
                console.log('✅ Basic .env file created!');
                console.log('⚠️  Please edit .env file and add your actual API key!');
                return false;
            }
        }
    } catch (error) {
        console.error('❌ Error setting up .env file:', error.message);
        return false;
    }
    
    return checkApiKey();
}

/**
 * Check if OpenAI API key is set
 */
function checkApiKey() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'your-openai-api-key-here') {
        console.log('✅ OpenAI API key found!');
        return true;
    } else {
        console.log('⚠️  OpenAI API key not properly configured.');
        console.log('Please set your API key using one of these methods:');
        console.log('1. Edit .env file and add your API key');
        console.log('2. Set environment variable: export OPENAI_API_KEY="your-key"');
        console.log('3. Use --api-key argument when running the application');
        return false;
    }
}

/**
 * Check if package.json exists and has correct structure
 */
async function checkPackageJson() {
    console.log('\n📄 Checking package.json...');
    
    try {
        const packageContent = await fs.readFile('package.json', 'utf8');
        const packageData = JSON.parse(packageContent);
        
        const requiredDeps = ['openai', 'music-metadata', 'commander', 'dotenv'];
        const missingDeps = requiredDeps.filter(dep => !packageData.dependencies || !packageData.dependencies[dep]);
        
        if (missingDeps.length > 0) {
            console.log('⚠️  Missing dependencies in package.json:', missingDeps.join(', '));
            return false;
        }
        
        console.log('✅ package.json looks good!');
        return true;
    } catch (error) {
        console.error('❌ Error reading package.json:', error.message);
        console.error('Please ensure package.json exists with required dependencies.');
        return false;
    }
}

/**
 * Test basic functionality
 */
async function testBasicFunctionality() {
    console.log('\n🧪 Testing basic functionality...');
    
    try {
        // Try to require main modules
        require('openai');
        require('music-metadata');
        require('commander');
        require('dotenv');
        
        console.log('✅ All required modules can be loaded!');
        return true;
    } catch (error) {
        console.error('❌ Error loading modules:', error.message);
        console.error('Try running: npm install');
        return false;
    }
}

/**
 * Main setup function
 */
async function main() {
    console.log('🚀 Audio Transcription and Analysis Setup (JavaScript)');
    console.log('='.repeat(60));
    
    // Check Node.js version
    checkNodeVersion();
    
    // Check package.json
    const packageOk = await checkPackageJson();
    if (!packageOk) {
        console.log('\n❌ Setup cannot continue without proper package.json');
        process.exit(1);
    }
    
    // Install dependencies
    installDependencies();
    
    // Test basic functionality
    const functionalityOk = await testBasicFunctionality();
    if (!functionalityOk) {
        console.log('\n❌ Setup cannot continue due to module loading issues');
        process.exit(1);
    }
    
    // Create directories
    await createDirectories();
    
    // Check/setup .env file and API key
    const apiKeyConfigured = await checkEnvFile();
    
    console.log('\n' + '='.repeat(60));
    if (apiKeyConfigured) {
        console.log('✅ Setup completed successfully!');
    } else {
        console.log('⚠️  Setup completed, but API key needs configuration!');
    }
    console.log('='.repeat(60));
    
    console.log('\n📖 Next steps:');
    if (!apiKeyConfigured) {
        console.log('1. Edit .env file and add your OpenAI API key');
        console.log('2. Run the application:');
    } else {
        console.log('1. Run the application:');
    }
    console.log('   node audio_analyzer.js your_audio_file.mp3');
    console.log('\n📚 For help:');
    console.log('   node audio_analyzer.js --help');
    
    console.log('\n💡 Useful commands:');
    console.log('   npm start your_audio.mp3    # Alternative way to run');
    console.log('   npm test                    # Show help');
    console.log('   node --version              # Check Node.js version');
    console.log('   npm list                    # Check installed packages');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled error:', error.message);
    process.exit(1);
});

// Run the setup
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Setup error:', error.message);
        process.exit(1);
    });
}

module.exports = { main };