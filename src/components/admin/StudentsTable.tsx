import React from 'react';
import { Eye, Trash2, User } from 'lucide-react';
import { Button } from '../ui/Button';
import type { User as UserType } from '../../types';

interface StudentsTableProps {
  students: UserType[];
  onDelete: (userId: string) => void;
}

export function StudentsTable({ students, onDelete }: StudentsTableProps) {
  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No students</h3>
        <p className="mt-1 text-sm text-gray-500">
          No student members found.
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
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-gray-400 mx-auto my-1" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{user.department}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{user.year}</td>
              <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium">
                <div className="flex justify-center space-x-2">
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => onDelete(user._id)}
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