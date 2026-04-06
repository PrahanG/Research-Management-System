'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Publications() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my');
  const [showAdd, setShowAdd] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [doi, setDoi] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [citations, setCitations] = useState('');
  const [syncing, setSyncing] = useState(false);

  const loadPubs = async () => {
    try {
      const [data, user] = await Promise.all([
          fetchWithAuth('/publications/'),
          fetchWithAuth('/auth/me')
      ]);
      setPublications(data);
      setCurrentUser(user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPubs();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/publications/', {
        method: 'POST',
        body: JSON.stringify({
          title,
          authors_str: authors,
          doi,
          published_date: publishedDate,
          citations: citations ? parseInt(citations) : 0
        })
      });
      setShowAdd(false);
      setTitle(''); setAuthors(''); setDoi(''); setPublishedDate(''); setCitations('');
      loadPubs(); // Reload list
    } catch (err) {
      alert("Error adding publication: " + err);
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true);
      const result = await fetchWithAuth('/publications/sync', { method: 'POST' });
      alert(result.message);
      loadPubs(); // Reload immediately - sync is now synchronous
    } catch (err: any) {
      alert("Error syncing: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const myPublications = publications.filter((p: any) => p.user_id === currentUser?.id);
  const discoverPublications = publications.filter((p: any) => p.user_id !== currentUser?.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Publications</h2>
        <div className="flex gap-2">
          {currentUser?.role !== 'Student' && (
              <Button onClick={() => setShowAdd(!showAdd)} variant="outline">
                {showAdd ? 'Cancel' : '+ Add Manual Entry'}
              </Button>
          )}
          {currentUser?.role !== 'Student' && (
              <Button onClick={handleSync} disabled={syncing}>
                {syncing ? 'Syncing...' : 'Sync Crossref'}
              </Button>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b pb-2">
         <button 
            className={`font-semibold pb-2 border-b-2 ${activeTab === 'my' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
            onClick={() => setActiveTab('my')}
         >
            My Publications
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
            <CardTitle>Add New Publication</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input type="text" value={title} onChange={e=>setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Authors (comma separated) *</Label>
                <Input type="text" value={authors} onChange={e=>setAuthors(e.target.value)} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>DOI (Optional)</Label>
                  <Input type="text" value={doi} onChange={e=>setDoi(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Citations</Label>
                  <Input type="number" min="0" value={citations} onChange={e=>setCitations(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Published Date</Label>
                  <Input type="date" value={publishedDate} onChange={e=>setPublishedDate(e.target.value)} />
                </div>
              </div>
              <Button type="submit">Save Publication</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* MY PUBLICATIONS TAB */}
      {activeTab === 'my' && (
        <div className="grid gap-4 md:grid-cols-2">
          {myPublications.length === 0 ? (
            <p className="text-muted-foreground col-span-2">You haven't tracked any publications yet.</p>
          ) : (
            myPublications.map((pub: any) => (
              <Card key={pub.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">{pub.title}</CardTitle>
                  <CardDescription>Authors: {pub.authors_str}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {pub.doi && <span><strong>DOI:</strong> {pub.doi}</span>}
                    {pub.published_date && <span><strong>Date:</strong> {pub.published_date}</span>}
                    <span><strong>Citations:</strong> {pub.citations}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* DISCOVER PUBLICATIONS TAB */}
      {activeTab === 'discover' && (
        <div className="grid gap-4 md:grid-cols-2">
          {discoverPublications.length === 0 ? (
            <p className="text-muted-foreground col-span-2">No community publications discovered yet.</p>
          ) : (
            discoverPublications.map((pub: any) => (
              <Card key={pub.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">{pub.title}</CardTitle>
                  <CardDescription>Authors: {pub.authors_str}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {pub.doi && <span><strong>DOI:</strong> {pub.doi}</span>}
                    {pub.published_date && <span><strong>Date:</strong> {pub.published_date}</span>}
                    <span><strong>Citations:</strong> {pub.citations}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
