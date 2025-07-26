import express from 'express';
import Club from '../models/Club.js';
import User from '../models/User.js';
import MembershipRequest from '../models/MembershipRequest.js';
import { auth, clubAdminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all clubs
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find({ isApproved: true })
      .populate('adminId', 'name email')
      .populate('events');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get club by ID
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('adminId', 'name email')
      .populate('events');
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.json(club);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update club (club admin only)
router.put('/:id', clubAdminAuth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if user is the club admin or system admin
    if (club.adminId.toString() !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedClub = await Club.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('adminId', 'name email');

    res.json(updatedClub);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Request to join club (authenticated users only)
router.post('/:id/request', auth, async (req, res) => {
  try {
    const clubId = req.params.id;
    const userId = req.userId;
    const { message } = req.body;
    
    // Check if club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    // Check if user exists and get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is already in a club
    if (user.clubId) {
      return res.status(400).json({ message: 'You are already a member of a club' });
    }
    
    // Check if user is trying to join their own club (if they're a club admin)
    if (user.role === 'club-admin') {
      return res.status(400).json({ message: 'Club admins cannot join other clubs' });
    }
    
    // Check if there's already a pending/approved request
    const existingRequest = await MembershipRequest.findOne({ 
      userId, 
      clubId,
      status: { $in: ['pending', 'approved'] }
    });
    
    if (existingRequest) {
      if (existingRequest.status === 'approved') {
        return res.status(400).json({ message: 'You are already a member of this club' });
      }
      return res.status(400).json({ message: 'You already have a pending request for this club' });
    }
    
    // Create membership request
    const membershipRequest = new MembershipRequest({
      userId,
      clubId,
      requestMessage: message || '',
      status: 'pending'
    });
    
    await membershipRequest.save();
    
    res.status(201).json({ 
      message: 'Membership request sent successfully! Wait for admin approval.',
      request: membershipRequest 
    });
  } catch (error) {
    console.error('Error creating membership request:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You already have a request for this club' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get membership requests for a club (club admin only)
router.get('/:id/requests', clubAdminAuth, async (req, res) => {
  try {
    const clubId = req.params.id;
    const { status = 'pending' } = req.query;
    
    // Verify the club admin has access to this club
    const user = await User.findById(req.userId);
    if (user.clubId.toString() !== clubId) {
      return res.status(403).json({ message: 'Access denied. You can only manage your own club.' });
    }
    
    const requests = await MembershipRequest.find({ 
      clubId, 
      status 
    })
    .populate('userId', 'name email avatar department year')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching membership requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/reject membership request (club admin only)
router.patch('/:id/requests/:requestId', clubAdminAuth, async (req, res) => {
  try {
    const { id: clubId, requestId } = req.params;
    const { status, response } = req.body; // status: 'approved' or 'rejected'
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected"' });
    }
    
    // Verify the club admin has access to this club
    const user = await User.findById(req.userId);
    if (user.clubId.toString() !== clubId) {
      return res.status(403).json({ message: 'Access denied. You can only manage your own club.' });
    }
    
    // Find the membership request (can be pending or approved for removal)
    const membershipRequest = await MembershipRequest.findOne({
      _id: requestId,
      clubId,
      status: { $in: ['pending', 'approved'] }
    }).populate('userId');
    
    if (!membershipRequest) {
      return res.status(404).json({ message: 'Membership request not found' });
    }
    
    const currentStatus = membershipRequest.status;
    
    // Update the request
    membershipRequest.status = status;
    membershipRequest.adminResponse = response || '';
    membershipRequest.reviewedBy = req.userId;
    membershipRequest.reviewedAt = new Date();
    
    await membershipRequest.save();
    
    // If approved, add user to club
    if (status === 'approved' && currentStatus === 'pending') {
      await User.findByIdAndUpdate(membershipRequest.userId._id, { 
        clubId: clubId 
      });
      
      // Increment club member count
      await Club.findByIdAndUpdate(clubId, { $inc: { members: 1 } });
    }
    
    // If rejecting an approved member (removing them), remove from club
    if (status === 'rejected' && currentStatus === 'approved') {
      await User.findByIdAndUpdate(membershipRequest.userId._id, { 
        clubId: null 
      });
      
      // Decrement club member count
      await Club.findByIdAndUpdate(clubId, { $inc: { members: -1 } });
    }
    
    res.json({ 
      message: `Membership request ${status} successfully`,
      request: membershipRequest 
    });
  } catch (error) {
    console.error('Error processing membership request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's membership request status for a club
router.get('/:id/request-status', auth, async (req, res) => {
  try {
    const clubId = req.params.id;
    const userId = req.userId;
    
    const request = await MembershipRequest.findOne({ 
      userId, 
      clubId 
    }).sort({ createdAt: -1 });
    
    res.json({ request });
  } catch (error) {
    console.error('Error fetching request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user by ID (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can delete users.' });
    }

    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    await Club.findByIdAndDelete(req.params.id);
    res.json({ message: 'Club deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;