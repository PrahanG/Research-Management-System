'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import OrgChart from '@/components/OrgChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my');

  // Form State
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Modals state
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinProjectId, setJoinProjectId] = useState<number | null>(null);
  const [joinNote, setJoinNote] = useState('');

  const [requestsModalOpen, setRequestsModalOpen] = useState(false);
  const [manageProjectId, setManageProjectId] = useState<number | null>(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  const loadProjects = async () => {
    try {
      const [data, user] = await Promise.all([
         fetchWithAuth('/projects/'),
         fetchWithAuth('/auth/me')
      ]);
      setProjects(data);
      setCurrentUser(user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/projects/', {
        method: 'POST',
        body: JSON.stringify({ title, description })
      });
      setShowAdd(false);
      setTitle(''); setDescription('');
      loadProjects();
    } catch (err: any) {
      alert("Error adding project: " + err.message);
    }
  }

  const handleAddMember = async (projectId: number) => {
    const email = prompt("Enter the user's email address:");
    const role = prompt("Enter role (lead, collaborator, student):", "collaborator");
    
    if (email && role) {
      try {
        await fetchWithAuth(`/projects/${projectId}/members`, {
          method: 'POST',
          body: JSON.stringify({ email, role })
        });
        loadProjects();
      } catch (err: any) {
        alert("Error mapping member: " + err.message);
      }
    }
  };

  const handleElevateMember = async (projectId: number) => {
    const userId = prompt("Enter the Internal User ID of the member to elevate to lead:");
    if (!userId) return;
    try {
      await fetchWithAuth(`/projects/${projectId}/members/${userId}/role`, { method: 'POST' });
      loadProjects();
    } catch (err: any) {
      alert("Error elevating member: " + err.message);
    }
  };

  const handleLeaveProject = async (projectId: number) => {
     if(!confirm("Are you sure you want to leave this project?")) return;
     try {
        await fetchWithAuth(`/projects/${projectId}/members/leave`, { method: 'DELETE' });
        loadProjects();
     } catch(e: any) {
        alert(e.message);
     }
  };

  const handleRequestJoinSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
         await fetchWithAuth(`/projects/${joinProjectId}/request`, {
             method: 'POST',
             body: JSON.stringify({ note: joinNote })
         });
         setJoinModalOpen(false);
         setJoinNote('');
         loadProjects();
     } catch (e: any) {
         alert(e.message);
     }
  };

  const openManageRequests = async (projectId: number) => {
      try {
          const data = await fetchWithAuth(`/projects/${projectId}/requests`);
          setPendingRequests(data);
          setManageProjectId(projectId);
          setRequestsModalOpen(true);
      } catch(e: any) {
          alert(e.message);
      }
  };

  const respondToRequest = async (reqId: number, action: 'accept' | 'decline') => {
      try {
          await fetchWithAuth(`/projects/${manageProjectId}/requests/${reqId}`, {
              method: 'POST',
              body: JSON.stringify({ action })
          });
          const data = await fetchWithAuth(`/projects/${manageProjectId}/requests`);
          setPendingRequests(data);
          loadProjects();
      } catch(e: any) {
          alert(e.message);
      }
  };

  if (loading) return <div>Loading records...</div>;

  const myProjects = projects.filter((p: any) => p.user_connection === 'member');
  const discoverProjects = projects.filter((p: any) => p.user_connection !== 'member');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Research Projects</h2>
        {currentUser?.role !== 'Student' && (
           <Button onClick={() => setShowAdd(!showAdd)}>
             {showAdd ? 'Cancel' : '+ New Project'}
           </Button>
        )}
      </div>

      <div className="flex gap-4 border-b pb-2">
         <button 
            className={`font-semibold pb-2 border-b-2 ${activeTab === 'my' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
            onClick={() => setActiveTab('my')}
         >
            My Projects
         </button>
         <button 
            className={`font-semibold pb-2 border-b-2 ${activeTab === 'discover' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
            onClick={() => setActiveTab('discover')}
         >
            Discover Community
         </button>
      </div>

      {showAdd && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Initialize Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div className="space-y-2">
                <Label>Project Title *</Label>
                <Input type="text" value={title} onChange={e=>setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Objective Description</Label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                  value={description} 
                  onChange={e=>setDescription(e.target.value)} 
                  rows={3} 
                />
              </div>
              <Button type="submit">Create Strategy</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* MY PROJECTS TAB */}
      {activeTab === 'my' && (
      <div className="grid gap-6">
        {myProjects.length === 0 ? (
          <p className="text-muted-foreground">You are not a member of any active projects.</p>
        ) : (
          myProjects.map((proj: any) => (
            <Card key={proj.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                 <div>
                   <CardTitle className="text-2xl mb-2">{proj.title}</CardTitle>
                   <div className="flex gap-2">
                     <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium">
                       {proj.status}
                     </span>
                     <span className="bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full font-medium">
                       Role: {proj.user_role}
                     </span>
                   </div>
                 </div>
                 <div className="flex flex-col gap-2 opacity-90 text-right items-end">
                    {proj.user_role === 'lead' && (
                        <>
                          <Button variant="default" size="sm" onClick={() => openManageRequests(proj.id)}>
                            Review Join Requests
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAddMember(proj.id)}>
                             + Map Member (Manual)
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleElevateMember(proj.id)}>
                             Elevate Member
                          </Button>
                        </>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => handleLeaveProject(proj.id)}>
                       Leave Project
                    </Button>
                 </div>
              </CardHeader>
              <CardContent>
                 <p className="mb-6">{proj.description}</p>
                 <OrgChart project={proj} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
      )}

      {/* DISCOVER PROJECTS TAB */}
      {activeTab === 'discover' && (
      <div className="grid gap-6">
        {discoverProjects.length === 0 ? (
          <p className="text-muted-foreground">No community projects available to discover.</p>
        ) : (
          discoverProjects.map((proj: any) => (
            <Card key={proj.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                 <div>
                   <CardTitle className="text-2xl mb-2">{proj.title}</CardTitle>
                   <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium">
                     {proj.status}
                   </span>
                 </div>
                 <div>
                   {proj.user_connection === 'pending' ? (
                       <Button variant="secondary" size="sm" disabled>Request Pending</Button>
                   ) : (
                       <Button variant="default" size="sm" onClick={() => {
                           setJoinProjectId(proj.id);
                           setJoinModalOpen(true);
                       }}>Request to Join</Button>
                   )}
                 </div>
              </CardHeader>
              <CardContent>
                 <p className="mb-6">{proj.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      )}

      {/* JOIN REQUEST DIALOG */}
      {joinModalOpen && (
         <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader>
                    <CardTitle>Request to Join Project</CardTitle>
                    <CardDescription>Send a note to the Project Leads explaining your interest.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRequestJoinSubmit} className="space-y-4">
                        <div className="space-y-2">
                           <Label>Introductory Note</Label>
                           <textarea 
                              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                              value={joinNote} 
                              onChange={e=>setJoinNote(e.target.value)} 
                              required
                              placeholder="Hello, I have strong experience in..."
                           />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" type="button" onClick={() => setJoinModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Submit Request</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
         </div>
      )}

      {/* MANAGE REQUESTS DIALOG */}
      {requestsModalOpen && (
         <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-lg max-h-[80vh] overflow-y-auto">
                <CardHeader>
                    <CardTitle>Manage Project Requests</CardTitle>
                    <CardDescription>Review and authorize pending collaborator integrations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {pendingRequests.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No active requests.</p>
                        ) : (
                            pendingRequests.map((req: any) => (
                                <div key={req.id} className="border p-4 rounded-md space-y-3">
                                    <div className="flex justify-between items-start">
                                       <div>
                                          <h4 className="font-semibold">{req.user_name}</h4>
                                          <p className="text-xs text-muted-foreground">{req.user_email} • {req.user_department || 'No dept'}</p>
                                       </div>
                                       <div className="flex gap-2">
                                          <Button size="sm" variant="destructive" onClick={() => respondToRequest(req.id, 'decline')}>Decline</Button>
                                          <Button size="sm" variant="default" onClick={() => respondToRequest(req.id, 'accept')}>Accept</Button>
                                       </div>
                                    </div>
                                    <div className="bg-muted p-3 text-sm rounded-md">
                                        <p className="italic">"{req.note}"</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Requested: {new Date(req.created_at).toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                        <div className="flex justify-end pt-4 border-t">
                            <Button variant="outline" onClick={() => setRequestsModalOpen(false)}>Close Window</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
         </div>
      )}
    </div>
  );
}
