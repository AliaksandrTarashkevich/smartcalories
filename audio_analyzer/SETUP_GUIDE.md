# 🚀 Complete Setup Guide (JavaScript/Node.js)

## 📁 **Шаг 1: Создать структуру проекта**

```bash
mkdir audio-analyzer
cd audio-analyzer
```

## 📄 **Шаг 2: Создать файлы**

Создайте следующие файлы и скопируйте содержимое из Claude артефактов:

### **Обязательные файлы:**
```
audio-analyzer/
├── audio_analyzer.js         # Главный файл приложения
├── package.json             # Зависимости и скрипты npm
├── .env.example             # Шаблон для API ключа
├── .gitignore               # Исключения для git
├── README.md                # Полная документация
└── QUICK_START.md           # Быстрый старт
```

### **Опциональные файлы:**
```
├── setup.js                 # Скрипт автоматической настройки
└── SETUP_GUIDE.md          # Этот файл
```

## 🔧 **Шаг 3: Проверить Node.js**

```bash
# Проверить версию Node.js
node --version

# Должно быть 16.0.0 или выше
# Если нет - скачать с https://nodejs.org/
```

**Если Node.js не установлен:**
- **Mac**: `brew install node` или скачать с [nodejs.org](https://nodejs.org/)
- **Windows**: Скачать с [nodejs.org](https://nodejs.org/)
- **Linux**: `sudo apt install nodejs npm` или через package manager

## 📦 **Шаг 4: Установить зависимости**

```bash
# Убедитесь что вы в папке audio-analyzer
npm install

# Это установит:
# - openai (OpenAI API client)
# - music-metadata (аудио метаданные)
# - commander (CLI интерфейс)
# - dotenv (переменные окружения)
```

**Ожидаемый вывод:**
```bash
added 45 packages, and audited 46 packages in 3s
found 0 vulnerabilities
```

## 🔑 **Шаг 5: Настроить API ключ**

```bash
# Скопировать шаблон
cp .env.example .env

# Отредактировать .env файл (любым текстовым редактором)
# nano .env
# code .env  
# notepad .env
```

**Содержимое .env должно быть:**
```
OPENAI_API_KEY=sk-ваш-настоящий-ключ-здесь
```

## 🎵 **Шаг 6: Подготовить тестовый файл**

Поместите ваш тестовый аудио файл в папку проекта:
```
audio-analyzer/
├── audio_analyzer.js
├── test_audio.mp3            # Ваш тестовый файл
├── node_modules/             # Зависимости (создается автоматически)
└── ... (остальные файлы)
```

## ✅ **Шаг 7: Проверить настройку (опционально)**

```bash
# Проверить что все зависимости установлены
npm list

# Проверить что приложение запускается
node audio_analyzer.js --help
```

**Ожидаемый вывод:**
```bash
Usage: audio-analyzer [options] <audio_file>

Audio Transcription and Analysis Tool

Arguments:
  audio_file              Path to the audio file to transcribe and analyze

Options:
  -V, --version           output the version number
  --api-key <key>         OpenAI API key
  -h, --help              display help for command
```

## 🚀 **Шаг 8: Запустить тестирование**

```bash
# Запустить приложение
node audio_analyzer.js test_audio.mp3

# Альтернативно через npm script
npm start test_audio.mp3
```

## 📊 **Шаг 9: Проверить результаты**

### **В консоли вы увидите:**
```
============================================================
AUDIO TRANSCRIPTION AND ANALYSIS
============================================================
Processing: test_audio.mp3
============================================================

✓ Audio file validation passed:
  - Format: .mp3
  - Size: 12.3MB
Audio duration: 180.50 seconds

Transcribing audio file: test_audio.mp3
✓ Transcription completed successfully
Generating summary...
✓ Summary generated successfully
Extracting topics...
✓ Topics extracted successfully
Calculating analytics...
✓ Analytics calculated successfully

📊 ANALYTICS:
==============================
{
  "word_count": 1280,
  "speaking_speed_wpm": 132,
  "frequently_mentioned_topics": [
    { "topic": "Customer Onboarding", "mentions": 6 }
  ]
}

✅ Processing completed successfully!
```

### **В папке output/ появится организованная структура:**
```
output/
└── test_audio/
    ├── transcription.md      # Полная транскрипция
    ├── summary.md           # AI резюме  
    └── analysis.json        # Аналитика с метаданными
```

**Преимущества новой структуры:**
✅ **Каждый аудио = своя папка** - легко находить результаты  
✅ **Простые имена файлов** - transcription.md, summary.md, analysis.json  
✅ **Нет беспорядка** - все организованно по папкам  
✅ **Обработка дубликатов** - test_audio_1, test_audio_2 автоматически

## 🔄 **Шаг 10: Повседневное использование**

**Каждый раз при запуске:**
```bash
# 1. Перейти в папку проекта
cd audio-analyzer

# 2. Запустить приложение (БЕЗ дополнительной настройки!)
node audio_analyzer.js your_audio.mp3

# Или через npm
npm start your_audio.mp3
```

## ❗ **Возможные проблемы и решения**

### **1. Node.js версия слишком старая**
```bash
❌ Node.js version 14.x.x detected. Required: 16.0.0+
```
**Решение:** Обновите Node.js с [nodejs.org](https://nodejs.org/)

### **2. Зависимости не установлены**
```bash
❌ Cannot find module 'openai'
❌ Cannot find module 'music-metadata'
```
**Решение:** 
```bash
npm install
```

### **3. API key не найден**
```bash
❌ Error: OpenAI API key required!
```
**Решение:** Проверьте .env файл:
```bash
cat .env
# Должно содержать: OPENAI_API_KEY=sk-ваш-ключ
```

### **4. Файл слишком большой**
```bash
❌ File too large: 30.5MB
Maximum allowed size: 25MB
```
**Решение:** Сожмите файл или разделите на части

### **5. npm install ошибки**
```bash
❌ npm ERR! code EACCES
```
**Решение:** 
```bash
# Mac/Linux - может потребоваться sudo
sudo npm install

# Или настроить npm без sudo
npm config set prefix ~/.npm-global
```

## 🎉 **Готово!**

Теперь ваш JavaScript проект полностью настроен и готов к использованию!

## 🌟 **Преимущества JavaScript версии:**

✅ **Проще установка** - нет virtual environment  
✅ **Меньше зависимостей** - встроенная работа с аудио метаданными  
✅ **Знакомая технология** для JavaScript разработчиков  
✅ **Кроссплатформенность** - работает везде где есть Node.js  
✅ **npm экосистема** - привычные инструменты  

## 📚 **Дополнительная помощь**

- **Полная документация:** README.md
- **Быстрый старт:** QUICK_START.md  
- **Node.js проблемы:** [nodejs.org/docs](https://nodejs.org/docs)
- **npm проблемы:** `npm help` или [docs.npmjs.com](https://docs.npmjs.com/)

## 🔍 **Полезные команды для отладки**

```bash
# Проверить версии
node --version
npm --version

# Проверить установленные пакеты
npm list

# Проверить .env файл
cat .env

# Запустить с отладкой
DEBUG=* node audio_analyzer.js test.mp3

# Очистить npm cache (если проблемы)
npm cache clean --force
```