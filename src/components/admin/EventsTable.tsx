import React from 'react';
import { Calendar, Clock, Eye, Edit, Trash2, PlusCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate, formatTime } from '../../lib/utils';
import type { Event } from '../../types';

interface EventsTableProps {
  events: Event[];
  onView: (eventId: string) => void;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  onCreateNew: () => void;
}

export function EventsTable({ events, onView, onEdit, onDelete, onCreateNew }: EventsTableProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first event.
        </p>
        <div className="mt-6">
          <Button onClick={onCreateNew}>
            <PlusCircle size={16} className="mr-2" />
            Create Event
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Event
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Registrations
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {events.map((event: Event) => (
            <tr key={event._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    <div className="text-xs text-gray-500">{event.category}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-900">{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-xs text-gray-500">
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{event.location}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={
                  event.status === 'upcoming' ? 'default' : 
                  event.status === 'ongoing' ? 'success' : 'secondary'
                }>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {event.registeredUsers?.length || 0}
                {event.maxParticipants && ` / ${event.maxParticipants}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div className="flex justify-center space-x-2">
                  <button 
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => onView(event._id)}
                  >
                    <Eye size={16} />
                    <span className="sr-only">View</span>
                  </button>
                  <button 
                    className="text-indigo-600 hover:text-indigo-900" 
                    onClick={() => onEdit(event)}
                  >
                    <Edit size={16} />
                    <span className="sr-only">Edit</span>
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-900" 
                    onClick={() => onDelete(event._id)}
                  >
                    <Trash2 size={16} />
                    <span className="sr-only">Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}