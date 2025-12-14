const API_BASE_URL = 'http://localhost:8080/api';

interface AuthResponse {
  token: string;
  role: string;
  name: string;
  id: number;
}

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }
  
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async registerUser(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    location: string;
  }) {
    return this.request('/auth/register/user', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async registerProvider(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    serviceType: string;
    experienceYears: number;
    serviceCost: number;
    location: string;
    availability: string;
  }) {
    return this.request('/auth/register/provider', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async loginAdmin(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login/admin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async searchProviders(serviceType?: string, location?: string) {
    const params = new URLSearchParams();
    if (serviceType) params.append('serviceType', serviceType);
    if (location) params.append('location', location);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/user/search${query}`);
  }
// Update this function to accept 'serviceType'
  async searchNearbyProviders(lat: number, lng: number, radius: number = 10, serviceType: string = '') {
    const params = new URLSearchParams();
    params.append('lat', lat.toString());
    params.append('lng', lng.toString());
    params.append('radius', radius.toString());
    if (serviceType) params.append('serviceType', serviceType);

    return this.request(`/user/search/nearby?${params.toString()}`);
  }
  async getProviderById(id: number) {
    return this.request(`/user/provider/${id}`);
  }
  // --- NEW RAZORPAY FUNCTIONS ---

  async createPaymentOrder(amount: number) {
    // Note: Using fetch directly here to get raw text response for ID
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });
    
    if (!response.ok) throw new Error('Failed to create payment order');
    return response.text(); // Returns the order_id string
  }

  async verifyPayment(paymentData: any) {
    return this.request('/payment/verify-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }
  // ---------------------------------

  async updateUserProfile(data: {
    name: string;
    email: string;
    phone: string;
    location: string;
  }) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async bookService(data: {
    serviceProviderId: number;
    dateOfService: string;
    timeSlot: string;
    paymentMethod: string; // <--- ADD THIS LINE
  }) {
    return this.request('/user/book', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserBookings() {
    return this.request('/user/bookings');
  }

  async submitReview(data: {
    bookingId: number;
    rating: number;
    comment: string;
  }) {
    return this.request('/user/review', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProviderProfile(data: {
    name: string;
    email: string;
    serviceType: string;
    phone: string;
    experienceYears: number;
    serviceCost: number;
    location: string;
    availability: string;
  }) {
    return this.request('/provider/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getProviderBookings() {
    return this.request('/provider/bookings');
  }

  async updateBookingStatus(bookingId: number, status: string) {
    return this.request(`/provider/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // ✅ USER - Get all service providers
  async getAllProviders() {
    return this.request('/user/providers');
  }

  // ✅ ADMIN - Get all service providers (renamed to avoid confusion)
  async getAllProvidersAdmin() {
    return this.request('/admin/providers');
  }

  async getAllUsers() {
    return this.request('/admin/users');
  }

  async deleteUser(id: number) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteProvider(id: number) {
    return this.request(`/admin/providers/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllBookings() {
    return this.request('/admin/bookings');
  }
}

export const api = new ApiService();