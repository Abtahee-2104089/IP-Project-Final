import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { Button } from '../ui/Button';

interface DashboardNavProps {
  activeTab: 'events' | 'members' |'clubs'| 'announcements' | 'settings';
  onTabChange: (tab: 'events' | 'members' |'clubs'| 'announcements' | 'settings') => void;
}

export function DashboardNav({ activeTab, onTabChange }: DashboardNavProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-wrap gap-2 p-2">
        <Button
          variant={activeTab === 'events' ? 'default' : 'ghost'}
          onClick={() => onTabChange('events')}
          className="flex items-center"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Events
        </Button>
        <Button
          variant={activeTab === 'members' ? 'default' : 'ghost'}
          onClick={() => onTabChange('members')}
          className="flex items-center"
        >
          <Users className="h-4 w-4 mr-2" />
          Members
        </Button>
        <Button
          variant={activeTab === 'clubs' ? 'default' : 'ghost'}
          onClick={() => onTabChange('clubs')}
          className="flex items-center"
        >
          <Users className="h-4 w-4 mr-2" />
          Clubs
        </Button>
      </div>
    </div>
  );
} 