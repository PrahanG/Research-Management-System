'use client';
import { useEffect, useState, use } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function UserProfile({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth(`/users/${unwrappedParams.id}`)
      .then(setData)
      .catch((err) => {
        console.error(err);
        alert(err.message || 'Failed to load user profile');
      })
      .finally(() => setLoading(false));
  }, [unwrappedParams.id]);

  if (loading) return <div>Loading Profile...</div>;
  if (!data) return <div>User not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-3xl">{data.profile.name}</CardTitle>
          <CardDescription className="text-base text-foreground/80">
            {data.profile.email} &mdash; <strong className="text-primary">{data.profile.role}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p><strong>Department:</strong> {data.profile.department || 'N/A'}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Member since {new Date(data.profile.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-2xl font-bold tracking-tight mb-4">Projects</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {data.projects.length === 0 ? (
            <p className="text-muted-foreground">No assigned projects.</p>
          ) : (
            data.projects.map((proj: any) => (
              <Card key={proj.project_id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{proj.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium text-primary">Role: {proj.role}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold tracking-tight mb-4">Publications</h3>
        <div className="grid gap-4">
          {data.publications.length === 0 ? (
            <p className="text-muted-foreground">No publications mapped.</p>
          ) : (
            data.publications.map((pub: any) => (
              <Card key={pub.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{pub.title}</CardTitle>
                  <CardDescription>Authors: {pub.authors_str}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {pub.doi && <span><strong>DOI:</strong> {pub.doi}</span>}
                    <span><strong>Citations:</strong> {pub.citations}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
