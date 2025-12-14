import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Users, Briefcase, Calendar, LogOut, Shield, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
}

interface Provider {
  id: number;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  experienceYears: number;
  serviceCost: number;
  location: string;
  availability: string;
  role: string;
}

interface Booking {
  id: number;
  dateOfService: string;
  timeSlot: string;
  status: string;
  userName: string;
  userEmail: string;
  providerName: string;
  providerEmail: string;
}

export default function AdminDashboard() {
  const { name, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'providers' | 'bookings'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const data = (await api.getAllUsers()) as User[];
        setUsers(data);
      } else if (activeTab === 'providers') {
        const data = (await api.getAllProvidersAdmin()) as Provider[];
        setProviders(data);
      } else if (activeTab === 'bookings') {
        const data = (await api.getAllBookings()) as any[];

const mapped: Booking[] = data.map((b: any) => ({
  id: b.id,
  dateOfService: b.dateOfService,
  timeSlot: b.timeSlot,
  status: b.status,
  userName: b.userName ?? 'Unknown',
  userEmail: b.userEmail ?? 'Unknown',
  providerName: b.providerName ?? 'Unknown',
  providerEmail: b.providerEmail ?? 'Unknown',
}));


        setBookings(mapped);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.deleteUser(id);
      loadData();
    } catch (error: any) {
      alert('Failed to delete user: ' + error.message);
    }
  };

  const handleDeleteProvider = async (id: number) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    try {
      await api.deleteProvider(id);
      loadData();
    } catch (error: any) {
      alert('Failed to delete provider: ' + error.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 mr-3" />
              <span className="text-xl font-bold">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Welcome, {name}</span>
              <button onClick={handleLogout} className="flex items-center hover:text-gray-300">
                <LogOut className="w-5 h-5 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-1 border-b-2 font-medium ${
                activeTab === 'users'
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" /> Users
            </button>

            <button
              onClick={() => setActiveTab('providers')}
              className={`pb-4 px-1 border-b-2 font-medium ${
                activeTab === 'providers'
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase className="w-5 h-5 inline mr-2" /> Providers
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`pb-4 px-1 border-b-2 font-medium ${
                activeTab === 'bookings'
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" /> Bookings
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && <p className="text-center text-gray-500">Loading data...</p>}

        {/* Users Table */}
        {!loading && activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{user.id}</td>
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.phone}</td>
                    <td className="px-6 py-4">{user.location}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Providers Table */}
        {!loading && activeTab === 'providers' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Availability</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {providers.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{provider.id}</td>
                    <td className="px-6 py-4">{provider.name}</td>
                    <td className="px-6 py-4">{provider.email}</td>
                    <td className="px-6 py-4">{provider.serviceType}</td>
                    <td className="px-6 py-4">{provider.experienceYears} yrs</td>
                    <td className="px-6 py-4">${provider.serviceCost.toFixed(2)}</td>
                    <td className="px-6 py-4">{provider.availability}</td>
                    <td className="px-6 py-4">{provider.role.replace('ROLE_', '')}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteProvider(provider.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bookings */}
        {!loading && activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p>
                      <strong>User:</strong> {booking.userName} ({booking.userEmail})
                    </p>
                    <p>
                      <strong>Provider:</strong> {booking.providerName} ({booking.providerEmail})
                    </p>
                    <p>
                      <strong>Date & Time:</strong> {booking.dateOfService} at {booking.timeSlot}
                    </p>
                  </div>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
