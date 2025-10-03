
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Activity, DollarSign, Calendar, Users, TrendingUp, BriefcaseMedical, Coffee, Plane, ArrowUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const trendingIllnesses = [
    { name: 'Influenza', cases: 120, trend: 15 },
    { name: 'Common Cold', cases: 98, trend: 8 },
    { name: 'Allergic Rhinitis', cases: 75, trend: 12 },
    { name: 'Gastroenteritis', cases: 50, trend: 5 },
    { name: 'Strep Throat', cases: 35, trend: 20 },
];

export default function DoctorDashboardPage() {
    const [status, setStatus] = useState<'consulting' | 'break' | 'leave'>('consulting');

    const stats = [
        { title: "Total Earnings", value: "₹12,500.00", change: "this month", icon: DollarSign },
        { title: "Upcoming Appointments", value: "3", change: "today", icon: Calendar },
        { title: "Total Patients", value: "42", change: "all time", icon: Users },
        { title: "Consultation Activity", value: "N/A", change: "coming soon", icon: Activity },
    ]
    
    const getStatusIcon = () => {
        switch(status) {
            case 'consulting': return <BriefcaseMedical className="w-5 h-5 text-green-500"/>;
            case 'break': return <Coffee className="w-5 h-5 text-amber-500"/>;
            case 'leave': return <Plane className="w-5 h-5 text-red-500"/>;
        }
    }

    return (
      <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Doctor Dashboard</h1>
            <p className="text-muted-foreground">Here's an overview of your practice.</p>
        </header>
        
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">Your Current Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        <span className="font-semibold text-lg">
                            {status === 'consulting' && 'Open for Consulting'}
                            {status === 'break' && 'On a Break'}
                            {status === 'leave' && 'On Leave'}
                        </span>
                    </div>
                     <Select value={status} onValueChange={(value: 'consulting' | 'break' | 'leave') => setStatus(value)}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Change status..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="consulting">Open for Consulting</SelectItem>
                            <SelectItem value="break">On a Break</SelectItem>
                            <SelectItem value="leave">On Leave</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map(stat => (
                 <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp/> Trending Illnesses</CardTitle>
                    <CardDescription>Top 5 illnesses currently on the rise in the community.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {trendingIllnesses.map(illness => (
                            <li key={illness.name} className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{illness.name}</p>
                                    <p className="text-sm text-muted-foreground">{illness.cases} reported cases</p>
                                </div>
                                <Badge variant="destructive" className="flex items-center gap-1">
                                    <ArrowUp className="w-3 h-3"/>
                                    <span>{illness.trend}%</span>
                                </Badge>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>A log of recent events and notifications.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="text-center py-16 text-muted-foreground">
                        <p>No recent activity to display.</p>
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    );
}
