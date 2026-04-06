'use client';
import React from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';

export function PublicationsTrendChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return <div className="flex h-[300px] items-center justify-center text-muted-foreground">No publication trend data available</div>;
    }
    const chartData = data;

    return (
        <div style={{ width: '100%', height: 300, minHeight: 300 }}>
             <ResponsiveContainer width="99%" minHeight={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <Line type="monotone" dataKey="citations" stroke="hsl(var(--primary))" strokeWidth={3} />
                    <Line type="monotone" dataKey="publications" stroke="hsl(var(--destructive))" strokeWidth={2} />
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="5 5" opacity={0.5} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))'}} />
                    <Legend />
                </LineChart>
             </ResponsiveContainer>
        </div>
    );
}

export function DepartmentComparisonChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return <div className="flex h-[300px] items-center justify-center text-muted-foreground">No department data available</div>;
    }
    const chartData = data;

    return (
        <div style={{ width: '100%', height: 300, minHeight: 300 }}>
             <ResponsiveContainer width="99%" minHeight={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="5 5" opacity={0.5} />
                    <XAxis dataKey="department" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))'}} />
                    <Bar dataKey="pubs" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
        </div>
    );
}
