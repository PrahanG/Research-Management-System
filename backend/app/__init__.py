import os
from dotenv import load_dotenv
load_dotenv()
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_caching import Cache

db = SQLAlchemy()
migrate = Migrate()
cache = Cache(config={'CACHE_TYPE': 'SimpleCache', 'CACHE_DEFAULT_TIMEOUT': 300})

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    
    # Configure Database, default to SQLite for local dev
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev_secret'),
        SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL', 'sqlite:///rams_v2.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET=os.environ.get('JWT_SECRET', 'jwt-super-secret-key'),
        CELERY_BROKER_URL=os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
        CELERY_RESULT_BACKEND=os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
    )

    if test_config is not None:
        app.config.from_mapping(test_config)
    
    # Initialize extensions
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        os.environ.get("FRONTEND_URL", "https://project-management-system-seven-mu.vercel.app"),
    ]
    CORS(app, origins=allowed_origins, supports_credentials=True)
    db.init_app(app)
    migrate.init_app(app, db)
    cache.init_app(app)
    
    # Register blueprints 
    from .routes import auth, publications, dashboard, projects, search, users
    app.register_blueprint(auth.bp)
    app.register_blueprint(publications.bp)
    app.register_blueprint(dashboard.bp)
    app.register_blueprint(projects.bp)
    app.register_blueprint(search.bp)
    app.register_blueprint(users.bp)

    @app.route('/health')
    def health():
        return {'status': 'ok'}

    return app
