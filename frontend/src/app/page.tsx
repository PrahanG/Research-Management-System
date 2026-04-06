'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { PublicationsTrendChart, DepartmentComparisonChart } from '@/components/Charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const data = await fetchWithAuth('/dashboard/stats');
        if (active) setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    
    // Initial load
    loadData();
    
    // Set up polling (Phase 4 Real-time approximation)
    const intervalId = setInterval(loadData, 30000); // 30 seconds
    
    return () => {
        active = false;
        clearInterval(intervalId);
    };
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!stats) return <div>Failed to load dashboard. Try logging in.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Institutional Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Publications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.publicationCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.activeProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faculty Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.facultyCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
          <Card>
              <CardHeader>
                <CardTitle>Publications Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <PublicationsTrendChart data={stats.publicationsTrend || []} />
              </CardContent>
          </Card>
          
          <Card>
              <CardHeader>
                <CardTitle>Department Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <DepartmentComparisonChart data={stats.departmentComparison || []} />
              </CardContent>
          </Card>
      </div>

      <h3 className="text-xl font-bold tracking-tight pt-4">Real-Time Activity Logs</h3>
      <Card>
        <CardContent className="pt-6">
          {stats.recentActivities && stats.recentActivities.length > 0 ? (
            <ul className="space-y-3">
              {stats.recentActivities.map((act: any) => (
                <li key={act.id} className="border-b last:border-0 pb-3">
                  <span className="text-xs text-muted-foreground">{new Date(act.timestamp).toLocaleDateString()}</span>
                  <p className="mt-1 text-sm">{act.description} <strong className="font-semibold">({act.event_type})</strong></p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity logged.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
