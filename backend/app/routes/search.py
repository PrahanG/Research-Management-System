from flask import Blueprint, request, jsonify
from .auth import token_required
from ..models import Project, Publication, User
from .. import db
from sqlalchemy import or_

bp = Blueprint('search', __name__, url_prefix='/api/search')

@bp.route('/', methods=['GET'])
@token_required
def global_search(current_user):
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({'users': [], 'projects': [], 'publications': []}), 200

    search_term = f"%{query}%"
    
    # Restrict to 5 results per category for responsiveness
    users = User.query.filter(
        or_(User.name.ilike(search_term), User.email.ilike(search_term))
    ).limit(5).all()
    
    projects = Project.query.filter(
        or_(Project.title.ilike(search_term), Project.description.ilike(search_term))
    ).limit(5).all()
    
    publications = Publication.query.filter(
        or_(Publication.title.ilike(search_term), Publication.authors_str.ilike(search_term))
    ).limit(5).all()

    return jsonify({
        'users': [u.to_dict() for u in users],
        'projects': [p.to_dict() for p in projects],
        'publications': [pub.to_dict() for pub in publications]
    }), 200
