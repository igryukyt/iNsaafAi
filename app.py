from flask import Flask, render_template
from flask_cors import CORS
from api.routes import api
import os

app = Flask(__name__)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///insaaf.db' # Removed
app.secret_key = 'super_secret_key_for_demo'

CORS(app)
# db.init_app(app) # Removed

app.register_blueprint(api, url_prefix='/api')

# Routes for serving HTML pages
@app.route('/')
def index():
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

if __name__ == '__main__':
    # with app.app_context(): # Removed
    #    db.create_all()      # Removed
    app.run(debug=True, port=5000)
