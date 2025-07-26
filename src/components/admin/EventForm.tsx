import React from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import type { Event } from '../../types';

interface EventFormProps {
  formData: {
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    category: string;
    image: string;
    maxParticipants: string;
    registrationFormUrl: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  editingEvent: Event | null;
  onCancel: () => void;
  categories: string[];
}

export function EventForm({
  formData,
  handleChange,
  handleSubmit,
  isSubmitting,
  editingEvent,
  onCancel,
  categories
}: EventFormProps) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-6">
        {editingEvent ? 'Edit Event' : 'Create New Event'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Event Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
            <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={categories.map(cat => ({ value: cat, label: cat }))}
            placeholder="Select event category"
            required
          />
          
          <Input
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
            <Input
              label="End Time"
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </div>
          
          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Maximum Participants (optional)"
            type="number"
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleChange}
            min="1"
          />
          
          <Input
            label="Cover Image URL"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="md:col-span-2"
          />

          <Input
            label="Registration Form Link"
            name="registrationFormUrl"
            value={formData.registrationFormUrl}
            onChange={handleChange}
            className="md:col-span-2"
            required
          />
          
          <Textarea
            label="Event Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="md:col-span-2"
            required
          />
        </div>
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? (editingEvent ? 'Updating...' : 'Creating...') 
              : (editingEvent ? 'Update Event' : 'Create Event')
            }
          </Button>
        </div>
      </form>
    </div>
  );
} 