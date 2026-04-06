from flask import Blueprint, request, jsonify
from datetime import datetime
from .auth import token_required
from ..models import Publication, ActivityEvent
from .. import db

bp = Blueprint('publications', __name__, url_prefix='/api/publications')

@bp.route('/', methods=['GET'])
@token_required
def get_publications(current_user):
    # Depending on role, we might want to see all or just user's. For MVP, return all.
    publications = Publication.query.all()
    return jsonify([p.to_dict() for p in publications]), 200

@bp.route('/', methods=['POST'])
@token_required
def create_publication(current_user):
    data = request.get_json()
    if not data or not data.get('title') or not data.get('authors_str'):
        return jsonify({'message': 'Missing title or authors'}), 400

    published_date_str = data.get('published_date')
    published_date = None
    if published_date_str:
        try:
            published_date = datetime.strptime(published_date_str, '%Y-%m-%d').date()
        except ValueError:
            pass

    doi_val = data.get('doi')
    if not doi_val:  # Catch empty string '' and convert securely to NULL
        doi_val = None

    new_pub = Publication(
        title=data['title'],
        authors_str=data['authors_str'],
        doi=doi_val,
        citations=data.get('citations', 0),
        published_date=published_date,
        user_id=current_user.id
    )

    db.session.add(new_pub)
    
    # Log activity
    activity = ActivityEvent(
        event_type="Publication Added",
        description=f"{current_user.name} added publication: {new_pub.title}",
        user_id=current_user.id
    )
    db.session.add(activity)
    
    db.session.commit()

    return jsonify(new_pub.to_dict()), 201

@bp.route('/sync', methods=['POST'])
@token_required
def trigger_sync(current_user):
    import requests as http_requests
    from datetime import datetime as dt

    author_name = current_user.name
    url = f"https://api.crossref.org/works?query.author={author_name}&rows=15&mailto=admin@rams.edu"

    try:
        response = http_requests.get(url, timeout=10)
        response.raise_for_status()
        items = response.json().get('message', {}).get('items', [])
        added_count = 0

        for item in items:
            title = item.get('title', ['Unnamed'])[0]
            doi = item.get('DOI') or None

            if doi and Publication.query.filter_by(doi=doi).first():
                continue

            authors = [f"{a.get('given','')} {a.get('family','')}".strip() for a in item.get('author', [])]
            authors_str = ", ".join(authors) if authors else "Unknown Authors"
            citations = item.get('is-referenced-by-count', 0)

            published_date = None
            try:
                date_parts = item.get('published-print', {}).get('date-parts', [[None]])[0]
                if date_parts[0]:
                    published_date = dt(date_parts[0], date_parts[1] if len(date_parts) > 1 else 1, date_parts[2] if len(date_parts) > 2 else 1).date()
            except Exception:
                pass

            new_pub = Publication(
                title=title, authors_str=authors_str, doi=doi,
                citations=citations, published_date=published_date,
                user_id=current_user.id
            )
            db.session.add(new_pub)
            added_count += 1

        if added_count > 0:
            activity = ActivityEvent(
                event_type="System Sync",
                description=f"Synced {added_count} publications for {current_user.name} from Crossref.",
                user_id=current_user.id
            )
            db.session.add(activity)

        db.session.commit()
        return jsonify({'message': f'Synced {added_count} new publications successfully'}), 200

    except Exception as e:
        return jsonify({'message': f'Sync failed: {str(e)}'}), 500

