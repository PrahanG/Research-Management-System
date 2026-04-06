from . import db
from datetime import datetime

class ProjectMember(db.Model):
    __tablename__ = 'project_member'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), primary_key=True)
    role = db.Column(db.String(50), default='collaborator') # lead, collaborator, student
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='project_memberships')
    project = db.relationship('Project', back_populates='members')

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='Faculty', index=True) # Admin, Faculty, Student
    department = db.Column(db.String(100), index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    publications = db.relationship('Publication', backref='author', lazy=True)
    project_memberships = db.relationship('ProjectMember', back_populates='user', cascade="all, delete-orphan")
    join_requests = db.relationship('ProjectJoinRequest', back_populates='user', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'department': self.department,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Project(db.Model):
    __tablename__ = 'project'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text)
    status = db.Column(db.String(50), default='Active', index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members = db.relationship('ProjectMember', back_populates='project', cascade="all, delete-orphan")
    join_requests = db.relationship('ProjectJoinRequest', back_populates='project', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'members': [{'user_id': m.user_id, 'name': m.user.name, 'role': m.role} for m in self.members]
        }

class Publication(db.Model):
    __tablename__ = 'publication'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), nullable=False, index=True)
    authors_str = db.Column(db.String(500), nullable=False)
    doi = db.Column(db.String(100), unique=True, nullable=True, index=True)
    citations = db.Column(db.Integer, default=0)
    published_date = db.Column(db.Date, index=True)
    
    # Optional relation to a specific project
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True, index=True)
    
    # Originating tracking user
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'authors_str': self.authors_str,
            'doi': self.doi,
            'citations': self.citations,
            'published_date': self.published_date.isoformat() if self.published_date else None,
            'user_id': self.user_id,
            'project_id': self.project_id
        }

class ActivityEvent(db.Model):
    __tablename__ = 'activity_event'
    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(50), nullable=False, index=True) # Seminar, Grant, Workshop, etc.
    description = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True, index=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'event_type': self.event_type,
            'description': self.description,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'user_id': self.user_id,
            'project_id': self.project_id
        }

class ProjectJoinRequest(db.Model):
    __tablename__ = 'project_join_request'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False, index=True)
    note = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='Pending') # Pending, Accepted, Declined
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='join_requests')
    project = db.relationship('Project', back_populates='join_requests')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'project_id': self.project_id,
            'user_name': self.user.name,
            'user_email': self.user.email,
            'user_department': self.user.department,
            'note': self.note,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

