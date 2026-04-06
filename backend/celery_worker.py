from app import create_app
from app.celery_utils import make_celery

app = create_app()
celery = make_celery(app)

# Load tasks
import app.tasks.publication_sync

if __name__ == '__main__':
    celery.start()
