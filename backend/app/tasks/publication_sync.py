import requests
from celery_worker import celery
from app.models import Publication, User, ActivityEvent
from app import db
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

@celery.task(bind=True)
def sync_publications_for_user(self, user_id):
    """
    Background job to sync publications from Crossref API
    for a specific user based on their name.
    """
    user = User.query.get(user_id)
    if not user:
        return f"User {user_id} not found."

    author_name = user.name
    url = f"https://api.crossref.org/works?query.author={author_name}&rows=15&mailto=admin@rams.edu"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        items = data.get('message', {}).get('items', [])
        added_count = 0

        for item in items:
            title = item.get('title', ['Unnamed'])[0]
            doi = item.get('DOI', None)
            
            # Skip if DOI already exists
            if doi and Publication.query.filter_by(doi=doi).first():
                continue
            
            # Compile authors string safely
            authors = []
            for author in item.get('author', []):
                authors.append(f"{author.get('given', '')} {author.get('family', '')}".strip())
            
            authors_str = ", ".join(authors) if authors else "Unknown Authors"
            
            citations = item.get('is-referenced-by-count', 0)
            
            # Extract published date
            published_date = None
            try:
                date_parts = item.get('published-print', {}).get('date-parts', [[None]])[0]
                if date_parts[0]:
                    year = date_parts[0]
                    month = date_parts[1] if len(date_parts) > 1 else 1
                    day = date_parts[2] if len(date_parts) > 2 else 1
                    published_date = datetime(year, month, day).date()
            except Exception:
                pass

            new_pub = Publication(
                title=title,
                authors_str=authors_str,
                doi=doi,
                citations=citations,
                published_date=published_date,
                user_id=user.id
            )
            db.session.add(new_pub)
            added_count += 1
            
        if added_count > 0:
            activity = ActivityEvent(
                event_type="System Sync",
                description=f"Auto-synced {added_count} new publications for {user.name} from Crossref.",
                user_id=user.id
            )
            db.session.add(activity)

        db.session.commit()
        return f"Successfully synced {added_count} publications for {user.name}"

    except Exception as e:
        logger.error(f"Failed to sync publications for {user_id}: {e}")
        return f"Sync failed: {str(e)}"
