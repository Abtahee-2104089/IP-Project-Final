import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Club from './models/Club.js';
import MembershipRequest from './models/MembershipRequest.js';

dotenv.config();

const checkMembershipConsistency = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cuet-clubsphere');
    console.log('Connected to MongoDB');

    // Find all students with clubId
    const studentsWithClubs = await User.find({
      role: 'student',
      clubId: { $exists: true, $ne: null }
    }).populate('clubId');

    console.log(`Found ${studentsWithClubs.length} students with club memberships:`);
    
    for (const student of studentsWithClubs) {
      console.log(`\nStudent: ${student.name} (${student.email})`);
      console.log(`Club: ${student.clubId?.name || 'Unknown Club'}`);
      
      // Check if there's a corresponding membership request
      const membershipRequest = await MembershipRequest.findOne({
        userId: student._id,
        clubId: student.clubId._id,
        status: 'approved'
      });
      
      if (membershipRequest) {
        console.log(`✅ Has approved membership request`);
      } else {
        console.log(`❌ Missing membership request - INCONSISTENCY DETECTED!`);
        
        // Create missing membership request
        const newRequest = new MembershipRequest({
          userId: student._id,
          clubId: student.clubId._id,
          status: 'approved',
          requestMessage: 'Automatically created for seeded data',
          adminResponse: 'Approved during data seeding',
          createdAt: new Date(),
          reviewedAt: new Date()
        });
        
        await newRequest.save();
        console.log(`✅ Created missing membership request`);
      }
    }

    // Check all clubs and their membership requests
    console.log('\n--- CLUB MEMBERSHIP SUMMARY ---');
    const clubs = await Club.find({});
    
    for (const club of clubs) {
      const pendingRequests = await MembershipRequest.countDocuments({
        clubId: club._id,
        status: 'pending'
      });
      
      const approvedRequests = await MembershipRequest.countDocuments({
        clubId: club._id,
        status: 'approved'
      });
      
      const actualMembers = await User.countDocuments({
        clubId: club._id,
        role: 'student'
      });
      
      console.log(`\nClub: ${club.name}`);
      console.log(`  Pending requests: ${pendingRequests}`);
      console.log(`  Approved requests: ${approvedRequests}`);
      console.log(`  Actual student members: ${actualMembers}`);
      
      if (approvedRequests !== actualMembers) {
        console.log(`  ⚠️  MISMATCH: ${approvedRequests} approved requests vs ${actualMembers} actual members`);
      } else {
        console.log(`  ✅ Consistent`);
      }
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error checking membership consistency:', error);
    process.exit(1);
  }
};

checkMembershipConsistency();
