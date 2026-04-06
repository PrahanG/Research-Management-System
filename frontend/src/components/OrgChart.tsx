import React from 'react';

export default function OrgChart({ project }: { project: any }) {
  if (!project.members || project.members.length === 0) {
    return <p className="text-muted-foreground">No members assigned yet.</p>;
  }

  // Segment by roles
  const leads = project.members.filter((m: any) => m.role === 'lead');
  const collaborators = project.members.filter((m: any) => m.role === 'collaborator');
  const students = project.members.filter((m: any) => m.role === 'student');

  return (
    <div className="mt-4 p-4 rounded-lg bg-secondary/50 border border-border">
      <h4 className="mb-4 font-semibold">Team Structure</h4>
      
      <div className="flex flex-col items-center gap-6">
        {/* Leads Level */}
        <div className="flex gap-4">
          {leads.map((m: any) => (
            <div key={m.user_id} className="border-2 border-primary p-3 rounded-lg text-center min-w-[150px] bg-background">
              <div className="font-bold">{m.name}</div>
              <div className="text-xs text-primary font-medium mt-1">Project Lead</div>
            </div>
          ))}
        </div>

        {/* Tree Line Connector */}
        {(collaborators.length > 0 || students.length > 0) && (
           <div className="w-[2px] h-6 bg-border"></div>
        )}

        {/* Collaborators Level */}
        {collaborators.length > 0 && (
          <div className="flex gap-4 flex-wrap justify-center">
            {collaborators.map((m: any) => (
              <div key={m.user_id} className="border border-foreground p-2 rounded-lg text-center min-w-[120px] bg-background">
                <div className="font-bold text-sm">{m.name}</div>
                <div className="text-[11px] text-muted-foreground mt-1">Collaborator</div>
              </div>
            ))}
          </div>
        )}

        {/* Students Level */}
        {students.length > 0 && (
          <div className={`flex gap-4 flex-wrap justify-center ${collaborators.length ? 'mt-4' : ''}`}>
            {students.map((m: any) => (
              <div key={m.user_id} className="border border-dashed border-muted-foreground p-2 rounded-lg text-center min-w-[120px] bg-background">
                <div className="text-sm">{m.name}</div>
                <div className="text-[11px] text-muted-foreground mt-1">Student</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
