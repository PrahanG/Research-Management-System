from flask import Blueprint, jsonify
from .auth import token_required
from ..models import User, ProjectMember, Publication
from .. import db

bp = Blueprint('users', __name__, url_prefix='/api/users')

@bp.route('/<int:user_id>', methods=['GET'])
@token_required
def get_user_profile(current_user, user_id):
    user = User.query.get_or_404(user_id)
    
    # Get user publications
    publications = Publication.query.filter_by(user_id=user.id).all()
    
    # Get user projects via memberships
    memberships = ProjectMember.query.filter_by(user_id=user.id).all()
    
    return jsonify({
        'profile': user.to_dict(),
        'publications': [p.to_dict() for p in publications],
        'projects': [{'project_id': m.project_id, 'title': m.project.title, 'role': m.role} for m in memberships]
    }), 200
