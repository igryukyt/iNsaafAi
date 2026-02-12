
import os

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'professional-grade-secret-key-change-in-prod'
    DEBUG = False
    TESTING = False
    
    # Paths
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))

    MODEL_DIR = os.path.join(BASE_DIR, 'models')
    IPC_DATA_PATH = os.path.join(BASE_DIR, 'data', 'ipc_data.json')
    
    # Model Artifacts
    IPC_VECTORIZER_PATH = os.path.join(MODEL_DIR, 'ipc_vectorizer.pkl')
    OUTCOME_MODEL_PATH = os.path.join(MODEL_DIR, 'outcome_classifier.pkl')
    LABEL_ENCODER_PATH = os.path.join(MODEL_DIR, 'label_encoder.pkl')
    
    # App Settings
    CORS_HEADERS = 'Content-Type'

class DevelopmentConfig(Config):
    """Development usage."""
    DEBUG = True

class ProductionConfig(Config):
    """Production usage."""
    DEBUG = False
