import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Calendar, Settings, LogOut, Briefcase, Star, CreditCard, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: number;
  dateOfService: string;
  timeSlot: string;
  status: string;
  userName: string;
  userEmail: string;
  paymentMethod?: string; // Added payment method
  review?: {
    id: number;
    rating: number;
    comment: string;
  };
}

export default function ProviderDashboard() {
  const { name, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    serviceType: '',
    phone: '',
    experienceYears: 0,
    serviceCost: 0,
    location: '',
    availability: '',
  });

  useEffect(() => {
    if (activeTab === 'bookings') {
      loadBookings();
    }
  }, [activeTab]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getProviderBookings();
      setBookings(data as Booking[]);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: number, status: string) => {
    try {
      await api.updateBookingStatus(bookingId, status);
      alert('Booking status updated successfully!');
      loadBookings();
    } catch (error: any) {
      alert('Failed to update status: ' + error.message);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateProviderProfile(profileData);
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let value: string | number = e.target.value;

    // If it's a number field, convert it safely
    if (e.target.type === 'number') {
      // If input is empty, set it to 0 (or keep it as empty string if you prefer)
      value = e.target.value === '' ? 0 : parseFloat(e.target.value);
    }

    setProfileData({ ...profileData, [e.target.name]: value });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Briefcase className="w-8 h-8 text-orange-600 mr-3" />
              <span className="text-xl font-bold text-gray-800">Provider Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <LogOut className="w-5 h-5 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 border-b">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`pb-4 px-1 border-b-2 font-medium ${
                activeTab === 'bookings'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-4 px-1 border-b-2 font-medium ${
                activeTab === 'profile'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="w-5 h-5 inline mr-2" />
              Profile Settings
            </button>
          </div>
        </div>

        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                No bookings yet
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{booking.userName}</h3>
                      <p className="text-gray-600">{booking.userEmail}</p>
                      <p className="text-gray-600 mt-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {booking.dateOfService} at {booking.timeSlot}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            booking.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : booking.status === 'ACCEPTED'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {booking.status}
                        </span>

                        {/* --- NEW PAYMENT INFO DISPLAY --- */}
                        {booking.paymentMethod && (
                          <span className={`text-xs font-medium flex items-center px-2 py-1 rounded ${
                              booking.paymentMethod === 'ONLINE' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                             {booking.paymentMethod === 'ONLINE' 
                                ? <><CreditCard className="w-3 h-3 mr-1" /> Paid Online</>
                                : <><Banknote className="w-3 h-3 mr-1" /> Collect Cash</>}
                          </span>
                        )}
                        {/* -------------------------------- */}
                    </div>
                  </div>

                  {booking.status === 'PENDING' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleUpdateBookingStatus(booking.id, 'ACCEPTED')}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateBookingStatus(booking.id, 'REJECTED')}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {booking.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(booking.id, 'COMPLETED')}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Mark as Completed
                    </button>
                  )}

                  {booking.review && (
                    <div className="mt-4 bg-gray-50 p-4 rounded">
                      <p className="font-medium text-gray-800">Customer Review</p>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < booking.review!.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-gray-600">({booking.review.rating}/5)</span>
                      </div>
                      <p className="text-gray-600 mt-2">{booking.review.comment}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            {/* ... (Your profile form code remains exactly the same) ... */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    name="name"
                    type="text"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                  <input
                    name="serviceType"
                    type="text"
                    value={profileData.serviceType}
                    onChange={handleProfileChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (Years)
                  </label>
                  <input
                    name="experienceYears"
                    type="number"
                    value={profileData.experienceYears}
                    onChange={handleProfileChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Cost ($)
                  </label>
                  <input
                    name="serviceCost"
                    type="number"
                    value={profileData.serviceCost}
                    onChange={handleProfileChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  name="location"
                  type="text"
                  value={profileData.location}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <textarea
                  name="availability"
                  value={profileData.availability}
                  onChange={handleProfileChange}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}