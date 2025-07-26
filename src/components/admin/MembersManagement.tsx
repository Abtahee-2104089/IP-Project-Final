import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { clubsAPI } from '../../services/api';

interface MembershipRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    department?: string;
    year?: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  requestMessage?: string;
  adminResponse?: string;
  createdAt: string;
}

interface MembersManagementProps {
  clubId: string;
}

export default function MembersManagement({ clubId }: MembersManagementProps) {
  const [pendingRequests, setPendingRequests] = useState<MembershipRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<MembershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  useEffect(() => {
    fetchRequests();
  }, [clubId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [pendingData, approvedData] = await Promise.all([
        clubsAPI.getRequests(clubId, 'pending'),
        clubsAPI.getRequests(clubId, 'approved')
      ]);
      setPendingRequests(pendingData);
      setApprovedRequests(approvedData);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (requestId: string, status: 'approved' | 'rejected', response?: string) => {
    try {
      setProcessing(requestId);
      await clubsAPI.processRequest(clubId, requestId, status, response);
      await fetchRequests(); // Refresh the lists
      alert(`Request ${status} successfully!`);
    } catch (error) {
      console.error('Error processing request:', error);
      alert('Failed to process request. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Club Members</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Club Members</h2>
        
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'approved'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Current Members ({approvedRequests.length})
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'pending' && (
          <div>
            {pendingRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending membership requests.</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Avatar
                          src={request.userId.avatar}
                          alt={request.userId.name}
                          name={request.userId.name}
                          size="md"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{request.userId.name}</h3>
                          <p className="text-sm text-gray-500">{request.userId.email}</p>
                          {request.userId.department && (
                            <p className="text-sm text-gray-500">
                              {request.userId.department} • Year {request.userId.year}
                            </p>
                          )}
                          {request.requestMessage && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              "{request.requestMessage}"
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Requested on {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleProcessRequest(request._id, 'approved')}
                          disabled={processing === request._id}
                        >
                          {processing === request._id ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleProcessRequest(request._id, 'rejected', 'Request declined')}
                          disabled={processing === request._id}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'approved' && (
          <div>
            {approvedRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No current members.</p>
            ) : (
              <div className="space-y-4">
                {approvedRequests.map((request) => (
                  <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Avatar
                          src={request.userId.avatar}
                          alt={request.userId.name}
                          name={request.userId.name}
                          size="md"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{request.userId.name}</h3>
                          <p className="text-sm text-gray-500">{request.userId.email}</p>
                          {request.userId.department && (
                            <p className="text-sm text-gray-500">
                              {request.userId.department} • Year {request.userId.year}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Joined on {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="success">Member</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleProcessRequest(request._id, 'rejected', 'Membership revoked by admin')}
                          disabled={processing === request._id}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          {processing === request._id ? 'Processing...' : 'Remove'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
