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
    from app.tasks.publication_sync import sync_publications_for_user
    
    # Fire off background task asynchronously (returns immediately)
    task = sync_publications_for_user.delay(current_user.id)
    
    return jsonify({
        'message': 'Publication synchronization triggered successfully',
        'task_id': task.id
    }), 202

