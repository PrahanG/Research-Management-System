from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    db.create_all()
    user = User.query.filter_by(email="admin@rams.edu").first()
    if not user:
        new_user = User(
            email="admin@rams.edu",
            password_hash=generate_password_hash("admin123", method="pbkdf2:sha256"),
            name="Admin User",
            role="Admin",
            department="Computer Science"
        )
        db.session.add(new_user)
        db.session.commit()
        print("Test user admin@rams.edu / admin123 created!")
    else:
        print("Test user already exists.")
