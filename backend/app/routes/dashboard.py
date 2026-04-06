from flask import Blueprint, jsonify
from sqlalchemy import func
from .auth import token_required
from ..models import Publication, User, Project, ActivityEvent
from .. import db, cache

bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@bp.route('/stats', methods=['GET'])
@token_required
@cache.cached(timeout=60, key_prefix='dashboard_stats')
def get_stats(current_user):
    pub_count = Publication.query.count()
    faculty_count = User.query.filter_by(role='Faculty').count()
    project_count = Project.query.count()
    
    recent_activities = ActivityEvent.query.order_by(ActivityEvent.timestamp.desc()).limit(10).all()

    # Dynamic Trend Aggregation
    trend_query = db.session.query(
        func.extract('month', Publication.created_at).label('month'),
        func.count(Publication.id).label('publications'),
        func.sum(Publication.citations).label('citations')
    ).group_by(func.extract('month', Publication.created_at)).all()
    
    month_names = {1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'}
    publicationsTrend = [
       {'month': month_names.get(int(row.month), 'Unknown'), 'publications': row.publications, 'citations': int(row.citations or 0)} 
       for row in trend_query if row.month
    ]

    # Dynamic Department Aggregation
    dept_query = db.session.query(
        User.department,
        func.count(Publication.id).label('pubs')
    ).join(Publication, User.id == Publication.user_id).group_by(User.department).all()

    departmentComparison = [
       {'department': row.department if row.department else 'Unassigned', 'pubs': row.pubs}
       for row in dept_query
    ]

    return jsonify({
        'publicationCount': pub_count,
        'facultyCount': faculty_count,
        'activeProjects': project_count,
        'recentActivities': [a.to_dict() for a in recent_activities],
        'publicationsTrend': publicationsTrend,
        'departmentComparison': departmentComparison
    }), 200
