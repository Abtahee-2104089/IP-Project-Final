import React from 'react';
import { Eye, Trash2, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Club } from '../../types';

interface ClubsTableProps {
  clubs: Club[];
  onView: (clubId: string) => void;
  onDelete: (clubId: string) => void;
}

export function ClubsTable({ clubs, onView, onDelete }: ClubsTableProps) {
  if (clubs.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No clubs</h3>
        <p className="mt-1 text-sm text-gray-500">
          No clubs found.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clubs.map((club) => (
            <tr key={club._id} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{club.name}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{club.category}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                {typeof club.adminId === 'object'
                    ? club.adminId.name || club.adminId.email || club.adminId._id
                    : club.adminId}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{club.description}</td>
              <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium">
                <div className="flex justify-center space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => onView(club._id)}
                  >
                    <Eye size={16} />
                    <span className="sr-only">View</span>
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => onDelete(club._id)}
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