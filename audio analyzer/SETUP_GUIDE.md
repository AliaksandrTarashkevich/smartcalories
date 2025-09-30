# 🚀 Complete Setup Guide (Step-by-Step)

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
├── audio_analyzer.py          # Главный файл приложения
├── requirements.txt           # Зависимости Python  
├── .env.example              # Шаблон для API ключа
├── .gitignore                # Исключения для git
├── README.md                 # Полная документация
└── QUICK_START.md            # Быстрый старт
```

### **Опциональные файлы:**
```
├── setup.py                  # Скрипт автоматической настройки
└── SETUP_GUIDE.md           # Этот файл
```

## 🐍 **Шаг 3: Создать виртуальное окружение**

**Mac/Linux:**
```bash
# Создать виртуальное окружение
python3 -m venv audio_env

# Активировать его
source audio_env/bin/activate

# Проверить - в prompt должно появиться (audio_env)
```

**Windows:**
```bash
# Создать виртуальное окружение  
python -m venv audio_env

# Активировать его
audio_env\Scripts\activate

# Проверить - в prompt должно появиться (audio_env)
```

## 📦 **Шаг 4: Установить зависимости**

```bash
# Убедитесь что виртуальное окружение активировано!
# В prompt должно быть: (audio_env)

pip install -r requirements.txt

# Или вручную:
pip install openai mutagen python-dotenv
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
├── audio_analyzer.py
├── test_audio.mp3            # Ваш тестовый файл
├── audio_env/                # Виртуальное окружение
└── ... (остальные файлы)
```

## ✅ **Шаг 7: Проверить настройку (опционально)**

```bash
# Убедитесь что virtual environment активирован
source audio_env/bin/activate    # Mac/Linux
# audio_env\Scripts\activate     # Windows

# Запустить автоматическую проверку
python setup.py
```

## 🚀 **Шаг 8: Запустить тестирование**

```bash
# ВАЖНО: Активировать virtual environment!
source audio_env/bin/activate    # Mac/Linux  
# audio_env\Scripts\activate     # Windows

# Запустить приложение
python audio_analyzer.py test_audio.mp3
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

### **В папке output/ появятся файлы:**
```
output/
├── test_audio_20250623_143022_transcription.md
├── test_audio_20250623_143022_summary.md
└── test_audio_20250623_143022_analysis.json
```

## 🔄 **Шаг 10: Повседневное использование**

**Каждый раз при запуске:**
```bash
# 1. Перейти в папку проекта
cd audio-analyzer

# 2. Активировать virtual environment
source audio_env/bin/activate    # Mac/Linux
# audio_env\Scripts\activate     # Windows

# 3. Запустить приложение
python audio_analyzer.py your_audio.mp3

# 4. По завершению (опционально)
deactivate
```

## ❗ **Возможные проблемы и решения**

### **1. externally-managed-environment (Mac)**
```bash
❌ This environment is externally managed
```
**Решение:** Используйте virtual environment (шаг 3)

### **2. Забыли активировать venv**
```bash
❌ ModuleNotFoundError: No module named 'openai'
```
**Решение:** 
```bash
source audio_env/bin/activate    # Mac/Linux
# audio_env\Scripts\activate     # Windows
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

## 🎉 **Готово!**

Теперь ваш проект полностью настроен и готов к использованию!

**Не забывайте:**
- Активировать virtual environment перед использованием
- API ключ хранится в .env файле (не попадет в git)
- Результаты сохраняются в папку output/

## 📚 **Дополнительная помощь**

- **Полная документация:** README.md
- **Быстрый старт:** QUICK_START.md  
- **Проблемы с настройкой:** README.md → Troubleshooting