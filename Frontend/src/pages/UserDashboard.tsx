import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Search, Calendar, Star, LogOut, User, CreditCard, Banknote, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'; // Add useLocation

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
  latitude?: number;
  longitude?: number;
}

interface Booking {
  id: number;
  dateOfService: string;
  timeSlot: string;
  status: string;
  providerName: string;
  providerEmail: string;
  paymentMethod?: string;
  review?: {
    id: number;
    rating: number;
    comment: string;
  };
}

export default function UserDashboard() {
  const { name, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // <--- 1. Add this hook
  const [activeTab, setActiveTab] = useState<'search' | 'bookings'>('search');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  // --- 2. ADD THIS NEW USEEFFECT ---
  // This checks if we came from the Map with a selected provider
  useEffect(() => {
    if (location.state && location.state.bookProvider) {
      // Automatically select the provider to open the modal
      setSelectedProvider(location.state.bookProvider);
      
      // Clear the state so it doesn't reopen if the page refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  // -------------------------------
  // --- CHANGED: Only Service Type State (Location Removed) ---
  const [searchServiceType, setSearchServiceType] = useState('');
  // ----------------------------------------------------------
  
  const [loading, setLoading] = useState(false);
  
  // Booking State
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Review State
  const [reviewBookingId, setReviewBookingId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    searchProviders();
    if (activeTab === 'bookings') {
      loadBookings();
    }
  }, [activeTab]);

  const searchProviders = async () => {
    setLoading(true);
    try {
      // We pass empty string for location since we removed the input
      const data = await api.searchProviders(searchServiceType, '');
      setProviders(data as Provider[]);
    } catch (error) {
      console.error('Failed to search providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getUserBookings();
      setBookings(data as Booking[]);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };
const handleBookService = async () => {
    if (!selectedProvider || !bookingDate || !bookingTime) {
      alert('Please fill all booking details');
      return;
    }

    // --- SCENARIO 1: ONLINE PAYMENT (RAZORPAY) ---
    if (paymentMethod === 'ONLINE') {
      try {
        setIsProcessingPayment(true); // Show loading on button

        // 1. Create Order on Backend
        const orderId = await api.createPaymentOrder(selectedProvider.serviceCost);

        // 2. Configure Razorpay Options
        const options = {
          key: "rzp_test_Rj6mQ8me6eurJL", // <--- YOUR KEY IS HERE
          amount: selectedProvider.serviceCost * 100, // Amount in paise
          currency: "INR",
          name: "ServiceFinder",
          description: `Booking with ${selectedProvider.name}`,
          order_id: orderId, // The Order ID we just got from backend
          
          // 3. Handler: This runs AFTER successful payment
          handler: async function (response: any) {
            try {
              // 4. Verify & Book on Backend
              await api.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                // Send booking details too so backend can save it
                bookingDTO: {
                  serviceProviderId: selectedProvider.id,
                  dateOfService: bookingDate,
                  timeSlot: bookingTime
                }
              });

              alert('Payment Successful! Booking Confirmed.');
              
              // Cleanup / Reset Form
              setSelectedProvider(null);
              setBookingDate('');
              setBookingTime('');
              setPaymentMethod('CASH');
              setActiveTab('bookings');

            } catch (err: any) {
              alert('Payment verification failed: ' + err.message);
            } finally {
              setIsProcessingPayment(false);
            }
          },
          prefill: {
            name: name, 
            email: "user@example.com",
            contact: "9999999999"
          },
          theme: {
            color: "#2563eb" // Blue
          },
          // Handle modal close by user
          modal: {
            ondismiss: function() {
              setIsProcessingPayment(false);
            }
          }
        };

        // 5. Open Razorpay
        const rzp = new (window as any).Razorpay(options);
        rzp.open();

      } catch (error: any) {
        alert('Payment initialization failed: ' + error.message);
        setIsProcessingPayment(false);
      }
      return; // Stop here, let Razorpay handle the rest
    }

    // --- SCENARIO 2: CASH PAYMENT ---
    try {
      setIsProcessingPayment(true);
      await api.bookService({
        serviceProviderId: selectedProvider.id,
        dateOfService: bookingDate,
        timeSlot: bookingTime,
        paymentMethod: 'CASH'
      });
      
      alert('Booking Confirmed! Please pay cash after service.');
      setSelectedProvider(null);
      setBookingDate('');
      setBookingTime('');
      setPaymentMethod('CASH'); 
      setActiveTab('bookings');
    } catch (error: any) {
      alert('Booking failed: ' + error.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewBookingId) return;

    try {
      await api.submitReview({
        bookingId: reviewBookingId,
        rating,
        comment,
      });
      alert('Review submitted successfully!');
      setReviewBookingId(null);
      setRating(5);
      setComment('');
      loadBookings();
    } catch (error: any) {
      alert('Review submission failed: ' + error.message);
    }
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
              <User className="w-8 h-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-800">Service Finder</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {name}</span>
              <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-gray-800">
                <LogOut className="w-5 h-5 mr-1" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 border-b">
          <div className="flex space-x-8">
            <button 
              onClick={() => setActiveTab('search')} 
              className={`pb-4 px-1 border-b-2 font-medium ${activeTab === 'search' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Search className="w-5 h-5 inline mr-2" /> Search Services
            </button>

            {/* --- MAP VIEW BUTTON --- */}
            <button
              onClick={() => navigate('/map-search', { 
                state: { 
                  serviceType: searchServiceType, // Pass ONLY the service type
                  locationText: '' // Pass empty location to force GPS use
                } 
              })}
              className="pb-4 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700"
            >
              <MapPin className="w-5 h-5 inline mr-2" />
              Map View (Near Me)
            </button>
            {/* ----------------------- */}

            <button 
              onClick={() => setActiveTab('bookings')} 
              className={`pb-4 px-1 border-b-2 font-medium ${activeTab === 'bookings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Calendar className="w-5 h-5 inline mr-2" /> My Bookings
            </button>
          </div>
        </div>

        {activeTab === 'search' && (
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Find Service Providers</h2>
              {/* --- UPDATED SEARCH BAR (NO LOCATION) --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Service Type (e.g., Plumbing, Tutor)" 
                  value={searchServiceType} 
                  onChange={(e) => setSearchServiceType(e.target.value)} 
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                />
                {/* Location Input Removed */}
                <button onClick={searchProviders} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  List All
                </button>
              </div>
              {/* -------------------------------------- */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <div key={provider.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{provider.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">Service:</span> {provider.serviceType}</p>
                    <p><span className="font-medium">Experience:</span> {provider.experienceYears} years</p>
                    <p><span className="font-medium">Cost:</span> ${provider.serviceCost}</p>
                    <p><span className="font-medium">Location:</span> {provider.location}</p>
                    <p><span className="font-medium">Available:</span> {provider.availability}</p>
                  </div>
                  <button onClick={() => setSelectedProvider(provider)} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Book Service</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ... (Bookings Tab and Modals remain exactly the same) ... */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{booking.providerName}</h3>
                    <p className="text-gray-600">{booking.providerEmail}</p>
                    <p className="text-gray-600 mt-2"><Calendar className="w-4 h-4 inline mr-1" /> {booking.dateOfService} at {booking.timeSlot}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      booking.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 
                      booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                    {booking.paymentMethod && (
                      <span className="text-xs text-gray-500 font-medium flex items-center">
                         {booking.paymentMethod === 'ONLINE' ? <CreditCard className="w-3 h-3 mr-1" /> : <Banknote className="w-3 h-3 mr-1" />}
                         {booking.paymentMethod}
                      </span>
                    )}
                  </div>
                </div>
                {booking.review ? (
                  <div className="mt-4 bg-gray-50 p-4 rounded"><p className="font-medium text-gray-800">Your Review</p><div className="flex items-center mt-1">{[...Array(5)].map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < booking.review!.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />))}</div><p className="text-gray-600 mt-2">{booking.review.comment}</p></div>
                ) : booking.status === 'COMPLETED' ? (
                  <button onClick={() => setReviewBookingId(booking.id)} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Write Review</button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
      
       {/* --- BOOKING MODAL --- */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Book Service</h2>
            <p className="text-gray-600 mb-2">Provider: <span className="font-semibold">{selectedProvider.name}</span></p>
            <p className="text-gray-600 mb-4">Total Cost: <span className="font-semibold text-green-600 text-lg">${selectedProvider.serviceCost}</span></p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
                <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Payment Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="space-y-2">
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${paymentMethod === 'CASH' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <input type="radio" name="paymentMethod" value="CASH" checked={paymentMethod === 'CASH'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                    <Banknote className="w-5 h-5 text-gray-600 ml-3 mr-2" />
                    <span className="text-gray-700">Cash After Service</span>
                  </label>

                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${paymentMethod === 'ONLINE' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <input type="radio" name="paymentMethod" value="ONLINE" checked={paymentMethod === 'ONLINE'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                    <CreditCard className="w-5 h-5 text-gray-600 ml-3 mr-2" />
                    <span className="text-gray-700">Pay Online Now</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleBookService}
                  disabled={isProcessingPayment}
                  className={`flex-1 text-white px-4 py-2 rounded-lg transition-colors ${isProcessingPayment ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                   {isProcessingPayment ? 'Processing...' : (paymentMethod === 'ONLINE' ? `Pay $${selectedProvider.serviceCost}` : 'Confirm Booking')}
                </button>
                <button onClick={() => { setSelectedProvider(null); setPaymentMethod('CASH'); }} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Review Modal */}
      {reviewBookingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Write Review</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Rating</label><div className="flex space-x-2">{[1, 2, 3, 4, 5].map((star) => (<button key={star} onClick={() => setRating(star)} className="focus:outline-none transform hover:scale-110 transition-transform"><Star className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} /></button>))}</div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Comment</label><textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Share your experience..." /></div>
              <div className="flex space-x-3"><button onClick={handleSubmitReview} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Submit Review</button><button onClick={() => setReviewBookingId(null)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">Cancel</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}