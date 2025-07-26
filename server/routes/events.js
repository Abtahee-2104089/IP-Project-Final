import express from 'express';
import Event from '../models/Event.js';
import { auth, clubAdminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('clubId', 'name logo')
      .populate('registeredUsers', 'name email avatar')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('clubId', 'name logo')
      .populate('registeredUsers', 'name email avatar department year')
      .populate('feedback.userId', 'name avatar');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event (club admin only)
router.post('/', clubAdminAuth, async (req, res) => {
  try {
    console.log('Creating event with user:', req.user);
    console.log('Request body:', req.body);
    
    const eventData = {
      ...req.body,
      clubId: req.user.clubId
    };
    
    console.log('Event data with clubId:', eventData);

    const event = new Event(eventData);
    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('clubId', 'name logo');

    console.log('Event created successfully:', populatedEvent);
    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    console.error('Error details:', error.message);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register for event
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already registered
    if (event.registeredUsers.includes(req.userId)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check if event is full
    if (event.maxParticipants && event.registeredUsers.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    event.registeredUsers.push(req.userId);
    await event.save();

    res.json({ message: 'Successfully registered for event' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Unregister from event
router.delete('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.registeredUsers = event.registeredUsers.filter(
      userId => userId.toString() !== req.userId
    );
    await event.save();

    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event (club admin only)
router.put('/:id', clubAdminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the event belongs to the admin's club
    if (event.clubId.toString() !== req.user.clubId.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only edit your club events.' });
    }

    // Update event with new data
    Object.assign(event, req.body);
    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('clubId', 'name logo')
      .populate('registeredUsers', 'name email avatar department year');

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event (club admin only)
router.delete('/:id', clubAdminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the event belongs to the admin's club
    if (event.clubId.toString() !== req.user.clubId.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only delete your club events.' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;