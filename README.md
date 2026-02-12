# InsaafAI - AI Legal Assistant ⚖️

InsaafAI is a comprehensive legal assistant web application designed to help users understand the Indian Penal Code (IPC), predict case outcomes, and improve their legal knowledge through interactive tools.

## 🚀 Features

### 1. **AI Case Predictor**
   - **Input**: Crime type, description, and optional evidence documents (PDF/Text).
   - **Output**: Predicted outcome, applicable IPC sections, and legal advice.
   - **Tech**: Uses **Sentence-BERT** for semantic matching of crime descriptions to IPC sections.

### 2. **IPC Browser & Search**
   - **Search**: Find sections by number (e.g., "302") or keyword (e.g., "theft").
   - **Database**: Contains 511+ IPC sections with simplified explanations.
   - **Multi-language Support**: (UI ready) Search and view results.

### 3. **AI Chat Assistant**
   - **Interactive Chat**: Ask questions like "What is the punishment for robbery?"
   - **Instant Answers**: powered by the semantic search engine.

### 4. **Learn Law & Quizzes**
   - **Education**: Modules on topics like "Crimes Against Women", "Cyber Laws", etc.
   - **Gamification**: 10 Levels of quizzes to test your mastery.

### 5. **User Dashboard**
   - **Profile**: Tracks your activity (cases analyzed, quiz scores).
   - **History**: View your past case predictions.

---

## 🛠️ Technology Stack

- **Backend**: Python (Flask)
- **AI/ML**: Sentence-Transformers (`all-MiniLM-L6-v2`), PyTorch, Numpy
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Database**: Google Firebase (Firestore & Authentication)
- **Data**: `ipc_data.json` (Structured Legal Dataset)

---

## 📂 Project Structure

```
Final InsaafAI/
├── api/
│   └── routes.py        # Core Backend Logic (AI, Search, API Endpoints)
├── static/
│   ├── css/style.css    # Global Styling
│   └── js/
│       ├── app.js       # Frontend Logic (Dashboard, Modules, UI)
│       └── api.js       # Authentication & API Integrations
├── templates/
│   ├── base.html        # Main Layout (Sidebar, Navigation)
│   ├── dashboard.html   # User Dashboard Container
│   └── login.html       # Login/Signup Page
├── app.py               # Application Entry Point (Flask Server)
├── config.py            # Configuration settings
├── ipc_data.json        # IPC Dataset
└── requirements.txt     # Python Dependencies
```

---

## ⚡ Setup & Run Instructions

### Prerequisites
- Python 3.8 or higher installed.
- Git (optional).

### 1. Install Dependencies
Open your terminal/command prompt in the project folder and run:
```bash
pip install -r requirements.txt
```

### 2. Run the Application
Start the Flask server:
```bash
python app.py
```
*Note: The first run might take a few seconds to load the AI model.*

### 3. Access InsaafAI
Open your web browser and navigate to:
**http://127.0.0.1:5000**

---

## ❓ Troubleshooting

- **Server won't start?**
  - Ensure no other app is running on port 5000.
  - Check if `ipc_data.json` is present in the root folder.

- **Slow Login/Startup?**
  - The first login might take a moment to initialize Firebase.
  - The first server start computes AI embeddings (cached for future runs).

- **"Module not found"?**
  - Make sure you are using the correct virtual environment if you created one.

---

## 📜 License
This project is for educational purposes.

**Developed with ❤️ for Legal Justice.**
