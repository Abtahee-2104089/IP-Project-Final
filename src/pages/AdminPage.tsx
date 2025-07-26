import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { eventsAPI, usersAPI, clubsAPI } from '../services/api';
import { useClubs, useEvents, useAllStudents } from '../hooks/useData';
import { EventForm, EventsTable, DashboardStats, DashboardNav, MembersManagement } from '../components/admin';
import type { Club, Event } from '../types';
import { StudentsTable } from '../components/admin/StudentsTable';
import { ClubsTable } from '../components/admin/ClubsTable';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clubs, loading: clubsLoading, refetch: refetchClub } = useClubs();
  const { students, loading: studentsLoading, refetch:refetchStudents } = useAllStudents();
  const { events, loading: eventsLoading, refetch: refetchEvents } = useEvents();
  const tabs =
    user?.role === 'admin'
      ? ['events', 'members', 'clubs']
      : user?.role === 'club-admin'
      ? ['events', 'members']
      : [];

  // Set default tab based on available tabs
  const [activeTab, setActiveTab] = useState(
    tabs.length > 0 ? (tabs[0] as 'events' | 'members' | 'clubs' | 'announcements' | 'settings') : 'events'
  );
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    category: '',
    image: 'https://images.pexels.com/photos/3760454/pexels-photo-3760454.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    maxParticipants: '',
    registrationFormUrl: ''
  });
    // Check if user is admin or club-admin
  if (!user || (user.role !== 'admin' && user.role !== 'club-admin')) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
        <Button onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </div>
    );
  }
  
  // Get club events if user is club-admin - but only after data is loaded
  const userClub = user.role === 'club-admin' && clubs.length > 0 && !clubsLoading ? 
    clubs.find((club: Club) => {
      // Handle both populated and non-populated adminId
      const clubAdminId = typeof club.adminId === 'string' ? club.adminId : club.adminId._id;
      return clubAdminId.toString() === user._id.toString();
    }) : null;
  
  const clubEvents =
  user.role === 'admin'
    ? events
    : user.role === 'club-admin'
      ? userClub
        ? events.filter((event: Event) => {
            if (!event.clubId) return false; // Skip events with no clubId
            const eventClubId =
              typeof event.clubId === 'string'
                ? event.clubId
                : event.clubId._id;
            return eventClubId === userClub._id;
          })
        : [] // If userClub is null, return empty array for club-admin
      : [];
  
  // Debug club events filtering
  console.log('All events:', events);
  console.log('User club:', userClub);
  console.log('Filtered club events:', clubEvents);
  
  // Show loading state
  if (clubsLoading || eventsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-gray-200 rounded-lg h-16 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      category: '',
      image: 'https://images.pexels.com/photos/3760454/pexels-photo-3760454.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      maxParticipants: '',
      registrationFormUrl: ''
    });
    setEditingEvent(null);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.split('T')[0], // Format date for input
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      category: event.category,
      image: event.image,
      maxParticipants: event.maxParticipants?.toString() || '',
      registrationFormUrl: event.registrationFormUrl || ''
    });
    setView('edit');
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await eventsAPI.delete(eventId);
      refetchEvents();
      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await usersAPI.delete(studentId);
      refetchStudents();
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting User:', error);
      alert('Failed to delete User. Please try again.');
    }
  };

  const handleDeleteClub = async (clubId: string) => {
    if (!confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
      return;
    }

    try {
      await clubsAPI.delete(clubId);
      refetchClub();
      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting club:', error);
      alert('Failed to delete club. Please try again.');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation for club-admin
    if (user.role === 'club-admin') {
      // Check if we're still loading clubs
      if (clubsLoading) {
        alert('Please wait for clubs data to load before creating an event.');
        return;
      }
      
      if (!userClub) {
        console.error('Club lookup failed:', {
          user: user,
          clubs: clubs,
          clubsLength: clubs.length,
          userRole: user.role,
          userId: user._id,
          clubsLoading: clubsLoading
        });
        alert('Club not found. Please try refreshing the page. If the issue persists, contact support.');
        return;
      }
      console.log('Club found successfully:', userClub);
    }
    
    setIsSubmitting(true);
    
    try {
      // Validate required fields before submission
      if (!formData.title.trim()) {
        alert('Please enter an event title.');
        return;
      }
      if (!formData.description.trim()) {
        alert('Please enter an event description.');
        return;
      }
      if (!formData.category) {
        alert('Please select an event category.');
        return;
      }
      if (!formData.location.trim()) {
        alert('Please enter an event location.');
        return;
      }
      
      // Validate URL if provided
      let validatedRegistrationFormUrl = undefined;
      if (formData.registrationFormUrl && formData.registrationFormUrl.trim()) {
        const url = formData.registrationFormUrl.trim();
        // Add protocol if missing
        const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
        try {
          new URL(fullUrl); // Validate URL
          validatedRegistrationFormUrl = fullUrl;
        } catch {
          alert('Please enter a valid URL for the registration form (e.g., https://example.com)');
          return;
        }
      }

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(), // Convert to proper date format
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location.trim(),
        category: formData.category,
        image: formData.image,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        registrationFormUrl: validatedRegistrationFormUrl,
      };
      
      console.log('Attempting to create/update event with data:', eventData);
      console.log('User club:', userClub);
      
      if (editingEvent) {
        // Update existing event
        await eventsAPI.update(editingEvent._id, eventData);
        alert('Event updated successfully!');
      } else {
        // Create new event
        const result = await eventsAPI.create(eventData);
        console.log('Event creation result:', result);
        alert('Event created successfully!');
      }
      
      // Reset form and go back to list
      resetForm();
      setView('list');
      
      // Refresh events list
      refetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      console.error('Event data that failed:', {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        category: formData.category,
        image: formData.image,
        maxParticipants: formData.maxParticipants,
        registrationFormUrl: formData.registrationFormUrl,
      });
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to ${editingEvent ? 'update' : 'create'} event. Check console for details. Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Categories for dropdown
  const categories = ['Workshop', 'Seminar', 'Contest', 'Performance', 'Sports', 'Discussion', 'Wellness'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {user.role === 'admin' ? 'Admin Dashboard' : `Club Admin Dashboard`}
        </h1>
      </div>

      {/* Dashboard navigation */}
      <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Stats overview */}
      <DashboardStats events={clubEvents} club={userClub} />

      {activeTab === 'events' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Manage Events</h2>
            {view === 'list' ? (
              <Button onClick={() => setView('create')}>
                <PlusCircle size={16} className="mr-2" />
                Create Event
              </Button>
            ) : (
              <Button variant="outline" onClick={() => { setView('list'); resetForm(); }}>
                Back to Events
              </Button>
            )}
          </div>

          {view === 'list' ? (
            <EventsTable 
              events={clubEvents}
              onView={(eventId) => navigate(`/events/${eventId}`)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreateNew={() => setView('create')}
            />
          ) : (
            <EventForm
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              editingEvent={editingEvent}
              onCancel={() => { setView('list'); resetForm(); }}
              categories={categories}
            />
          )}
        </div>
      )}

      {activeTab === 'members' && (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {user.role === 'club-admin' && userClub ? (
        <MembersManagement clubId={userClub._id} />
      ) : user.role === 'admin' ? (
        <StudentsTable 
          students={students}
          onDelete={handleDeleteStudent}
        />
      ) : (
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Club Members</h2>
          <p className="text-gray-500">
            Unable to load club information. Please refresh the page.
          </p>
        </div>
      )}
    </div>
  )}

      {/* Only show Clubs tab for admin */}
      {activeTab === 'clubs' && (
        user?.role === 'admin' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Clubs Management</h2>
            <ClubsTable
              clubs={clubs}
              onView={(clubId) => navigate(`/clubs/${clubId}`)}
              onDelete={handleDeleteClub}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Clubs Management</h2>
            <p className="text-gray-500">
              You do not have permission to manage clubs.
            </p>
          </div>
        )
      )}
    </div>
  );
}