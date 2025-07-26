import React from 'react';
import { Calendar, Users, Clock, BarChart } from 'lucide-react';
import type { Event, Club } from '../../types';

interface DashboardStatsProps {
  events: Event[];
  club?: Club | null;
}

export function DashboardStats({ events, club }: DashboardStatsProps) {
  const upcomingEvents = events.filter((e: Event) => e.status === 'upcoming').length;
  const totalRegistrations = events.reduce((acc: number, event: Event) => acc + (event.registeredUsers?.length || 0), 0);
  const activeMembers = club?.members || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Events</p>
            <h3 className="text-2xl font-bold">{events.length}</h3>
          </div>
          <Calendar className="h-8 w-8 text-blue-500" />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Active Members</p>
            <h3 className="text-2xl font-bold">{activeMembers}</h3>
          </div>
          <Users className="h-8 w-8 text-green-500" />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Upcoming Events</p>
            <h3 className="text-2xl font-bold">{upcomingEvents}</h3>
          </div>
          <Clock className="h-8 w-8 text-purple-500" />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Registrations</p>
            <h3 className="text-2xl font-bold">{totalRegistrations}</h3>
          </div>
          <BarChart className="h-8 w-8 text-amber-500" />
        </div>
      </div>
    </div>
  );
} 