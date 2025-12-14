import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Star, Calendar, CreditCard, Banknote, MapPin, Briefcase, Clock, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

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
}

export default function ProviderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { name } = useAuth(); // Get user name for Razorpay
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Booking State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadProvider = async () => {
      try {
        if (!id) return;
        const data = await api.getProviderById(parseInt(id));
        setProvider(data as Provider);
      } catch (error) {
        console.error("Failed to load provider", error);
      } finally {
        setLoading(false);
      }
    };
    loadProvider();
  }, [id]);

  const handleBookService = async () => {
    if (!provider || !bookingDate || !bookingTime) {
      alert('Please fill all booking details');
      return;
    }

    // --- SCENARIO 1: ONLINE PAYMENT (RAZORPAY) ---
    if (paymentMethod === 'ONLINE') {
       try {
        setIsProcessing(true);

        // 1. Create Order
        const orderId = await api.createPaymentOrder(provider.serviceCost);

        // 2. Configure Razorpay
        const options = {
          key: "rzp_test_Rj6mQ8me6eurJL", // <--- YOUR KEY HERE
          amount: provider.serviceCost * 100,
          currency: "INR",
          name: "ServiceFinder",
          description: `Booking with ${provider.name}`,
          order_id: orderId,
          
          handler: async function (response: any) {
            try {
              // 3. Verify & Book
              await api.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingDTO: {
                  serviceProviderId: provider.id,
                  dateOfService: bookingDate,
                  timeSlot: bookingTime
                }
              });

              alert('Payment Successful! Booking Confirmed.');
              setShowBookingModal(false);
              navigate('/user/dashboard'); // Redirect to dashboard

            } catch (err: any) {
              alert('Payment verified failed: ' + err.message);
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: name, 
            email: "user@example.com",
            contact: "9999999999"
          },
          theme: {
            color: "#2563eb"
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
            }
          }
        };

        // 4. Open Popup
        const rzp = new (window as any).Razorpay(options);
        rzp.open();

      } catch (error: any) {
        alert('Payment initialization failed: ' + error.message);
        setIsProcessing(false);
      }
      return; // Stop here
    }

    // --- SCENARIO 2: CASH PAYMENT ---
    try {
      setIsProcessing(true);
      await api.bookService({
        serviceProviderId: provider.id,
        dateOfService: bookingDate,
        timeSlot: bookingTime,
        paymentMethod: 'CASH'
      });
      
      alert('Booking Confirmed! Please pay cash after service.');
      setShowBookingModal(false);
      navigate('/user/dashboard');
    } catch (error: any) {
      alert('Booking failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!provider) return <div className="flex justify-center items-center h-screen">Provider not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-5 h-5 mr-2" /> Back
      </button>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-blue-600 h-32 relative"></div>
        
        <div className="px-8 pb-8">
          {/* Profile Info */}
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="bg-white p-2 rounded-full shadow-lg">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-blue-50">
                    <span className="text-3xl font-bold text-blue-600">{provider.name.charAt(0)}</span>
                </div>
            </div>
            <div className="mb-2">
                 <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" /> Verified Provider
                 </span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
            <p className="text-lg text-blue-600 font-medium">{provider.serviceType}</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                        <Briefcase className="w-5 h-5 mr-3 text-gray-400" />
                        <span>{provider.experienceYears} Years Experience</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                        <span>{provider.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <Clock className="w-5 h-5 mr-3 text-gray-400" />
                        <span>{provider.availability}</span>
                    </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Service Cost</p>
                    <p className="text-3xl font-bold text-gray-900 mb-4">${provider.serviceCost}</p>
                    <button 
                        onClick={() => setShowBookingModal(true)}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                    >
                        Book Now
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Book Appointment</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-1 gap-3">
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}>
                    <input type="radio" name="paymentMethod" value="CASH" checked={paymentMethod === 'CASH'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-4 w-4 text-blue-600" />
                    <Banknote className="w-5 h-5 text-gray-600 ml-3 mr-2" />
                    <span className="font-medium text-gray-700">Cash After Service</span>
                  </label>

                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'ONLINE' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}>
                    <input type="radio" name="paymentMethod" value="ONLINE" checked={paymentMethod === 'ONLINE'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-4 w-4 text-blue-600" />
                    <CreditCard className="w-5 h-5 text-gray-600 ml-3 mr-2" />
                    <span className="font-medium text-gray-700">Pay Online Now</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button onClick={handleBookService} disabled={isProcessing} className={`flex-1 text-white px-4 py-3 rounded-lg font-medium transition-colors ${isProcessing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                   {isProcessing ? 'Processing...' : (paymentMethod === 'ONLINE' ? `Pay & Book` : 'Confirm Booking')}
                </button>
                <button onClick={() => setShowBookingModal(false)} className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}