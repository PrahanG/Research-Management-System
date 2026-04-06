from flask import Blueprint, request, jsonify
from .auth import token_required
from ..models import Project, ProjectMember, User, ActivityEvent, ProjectJoinRequest
from .. import db

bp = Blueprint('projects', __name__, url_prefix='/api/projects')

@bp.route('/', methods=['GET'])
@token_required
def get_projects(current_user):
    projects = Project.query.all()
    res = []
    for p in projects:
        p_dict = p.to_dict()
        # Evaluate context for current user
        member = next((m for m in p.members if m.user_id == current_user.id), None)
        if member:
            p_dict['user_connection'] = 'member'
            p_dict['user_role'] = member.role
        else:
            pending_req = ProjectJoinRequest.query.filter_by(project_id=p.id, user_id=current_user.id, status='Pending').first()
            if pending_req:
                p_dict['user_connection'] = 'pending'
            else:
                p_dict['user_connection'] = 'none'
        res.append(p_dict)
    return jsonify(res), 200

@bp.route('/', methods=['POST'])
@token_required
def create_project(current_user):
    if current_user.role == 'Student':
        return jsonify({'message': 'Students cannot create organizations'}), 403

    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'message': 'Missing title'}), 400

    new_project = Project(
        title=data['title'],
        description=data.get('description', '')
    )
    db.session.add(new_project)
    
    # Automatically add creator as lead
    lead_member = ProjectMember(
        user_id=current_user.id,
        project=new_project,
        role='lead'
    )
    db.session.add(lead_member)
    
    activity = ActivityEvent(
        event_type="Project Created",
        description=f"{current_user.name} created new project: {new_project.title}",
        user_id=current_user.id,
        project_id=new_project.id
    )
    db.session.add(activity)
    
    db.session.commit()
    return jsonify(new_project.to_dict()), 201

@bp.route('/<int:project_id>/members', methods=['POST'])
@token_required
def add_member(current_user, project_id):
    project = Project.query.get_or_404(project_id)
    
    # Simple check if current_user is lead (could be decoupled later)
    is_lead = any(m.user_id == current_user.id and m.role == 'lead' for m in project.members)
    if not is_lead and current_user.role != 'Admin':
        return jsonify({'message': 'Only leads or admins can add members'}), 403

    data = request.get_json()
    user_email = data.get('email')
    role = data.get('role', 'collaborator')
    
    user_to_add = User.query.filter_by(email=user_email).first()
    if not user_to_add:
        return jsonify({'message': 'User not found'}), 404

    # Check if already in project
    existing = ProjectMember.query.filter_by(user_id=user_to_add.id, project_id=project.id).first()
    if existing:
        return jsonify({'message': 'User already in project'}), 400

    new_member = ProjectMember(
        user_id=user_to_add.id,
        project_id=project.id,
        role=role
    )
    db.session.add(new_member)
    db.session.commit()
    
    return jsonify(project.to_dict()), 201

@bp.route('/<int:project_id>/request', methods=['POST'])
@token_required
def request_join(current_user, project_id):
    project = Project.query.get_or_404(project_id)
    data = request.get_json()
    note = data.get('note', '')

    existing_member = ProjectMember.query.filter_by(user_id=current_user.id, project_id=project_id).first()
    if existing_member:
        return jsonify({'message': 'Already a member'}), 400

    existing_req = ProjectJoinRequest.query.filter_by(user_id=current_user.id, project_id=project_id, status='Pending').first()
    if existing_req:
        return jsonify({'message': 'Request already pending'}), 400

    new_req = ProjectJoinRequest(user_id=current_user.id, project_id=project_id, note=note)
    db.session.add(new_req)
    
    activity = ActivityEvent(
        event_type="Join Request",
        description=f"{current_user.name} requested to join project: {project.title}",
        user_id=current_user.id,
        project_id=project.id
    )
    db.session.add(activity)
    
    db.session.commit()
    return jsonify({'message': 'Request submitted successfully'}), 201

@bp.route('/<int:project_id>/requests', methods=['GET'])
@token_required
def get_requests(current_user, project_id):
    project = Project.query.get_or_404(project_id)
    is_lead = any(m.user_id == current_user.id and m.role == 'lead' for m in project.members)
    if not is_lead and current_user.role != 'Admin':
        return jsonify({'message': 'Only leads can view requests'}), 403

    reqs = ProjectJoinRequest.query.filter_by(project_id=project_id, status='Pending').all()
    return jsonify([r.to_dict() for r in reqs]), 200

@bp.route('/<int:project_id>/requests/<int:request_id>', methods=['POST'])
@token_required
def handle_request(current_user, project_id, request_id):
    project = Project.query.get_or_404(project_id)
    is_lead = any(m.user_id == current_user.id and m.role == 'lead' for m in project.members)
    if not is_lead and current_user.role != 'Admin':
        return jsonify({'message': 'Only leads can authorize requests'}), 403

    req_obj = ProjectJoinRequest.query.get_or_404(request_id)
    if req_obj.project_id != project_id:
        return jsonify({'message': 'Mismatched project and request'}), 400

    data = request.get_json()
    action = data.get('action') # "accept" or "decline"

    if action == 'accept':
        req_obj.status = 'Accepted'
        
        # Explicitly assign Student role inside the Project if their universal role is Student
        assigned_role = 'student' if req_obj.user.role == 'Student' else 'collaborator'
        
        new_member = ProjectMember(user_id=req_obj.user_id, project_id=project_id, role=assigned_role)
        db.session.add(new_member)
    elif action == 'decline':
        req_obj.status = 'Declined'
    else:
        return jsonify({'message': 'Invalid action'}), 400

    db.session.commit()
    return jsonify({'message': f'Request {action}ed successfully'}), 200

@bp.route('/<int:project_id>/members/<int:target_user_id>/role', methods=['POST'])
@token_required
def elevate_member(current_user, project_id, target_user_id):
    project = Project.query.get_or_404(project_id)
    is_lead = any(m.user_id == current_user.id and m.role == 'lead' for m in project.members)
    if not is_lead and current_user.role != 'Admin':
        return jsonify({'message': 'Only leads can elevate members'}), 403

    target_member = ProjectMember.query.filter_by(user_id=target_user_id, project_id=project_id).first()
    if not target_member:
        return jsonify({'message': 'User is not a member of this project'}), 404

    target_member.role = 'lead'
    db.session.commit()
    return jsonify({'message': 'Member elevated to lead successfully', 'project': project.to_dict()}), 200

@bp.route('/<int:project_id>/members/leave', methods=['DELETE'])
@token_required
def leave_project(current_user, project_id):
    target_member = ProjectMember.query.filter_by(user_id=current_user.id, project_id=project_id).first()
    if not target_member:
        return jsonify({'message': 'You are not a member of this project'}), 400

    # Ensure project is not left without leads
    project = Project.query.get_or_404(project_id)
    if target_member.role == 'lead':
        lead_count = sum(1 for m in project.members if m.role == 'lead')
        if lead_count <= 1:
            return jsonify({'message': 'Cannot leave project as the only lead. Elevate someone else first.'}), 400

    db.session.delete(target_member)
    
    activity = ActivityEvent(
        event_type="Project Leave",
        description=f"{current_user.name} left project: {project.title}",
        user_id=current_user.id,
        project_id=project.id
    )
    db.session.add(activity)

    db.session.commit()
    return jsonify({'message': 'Left project successfully'}), 200
