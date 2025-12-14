package com.app.servicefinder.service;

import com.app.servicefinder.dto.BookingDTO;
import com.app.servicefinder.dto.ReviewDTO;
import com.app.servicefinder.dto.UpdateProviderProfileDTO;
import com.app.servicefinder.exception.BadRequestException;
import com.app.servicefinder.exception.ResourceNotFoundException;
import com.app.servicefinder.model.Booking;
import com.app.servicefinder.model.BookingStatus;
import com.app.servicefinder.model.Review;
import com.app.servicefinder.model.ServiceProvider;
import com.app.servicefinder.repository.BookingRepository;
import com.app.servicefinder.repository.ProviderRepository;
import com.app.servicefinder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
public class ProviderService {

    private final ProviderRepository providerRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // --- Inject API Key ---
    @Value("${opencage.api.key}")
    private String openCageApiKey;

    // --- Tools for API calls ---
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ServiceProvider updateProfile(Long providerId, UpdateProviderProfileDTO dto) {
        // Get logged-in user
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (!(principal instanceof ServiceProvider loggedInProvider)) {
            throw new BadRequestException("Only providers can update provider profiles");
        }

        // Ensure provider can only update their own profile
        if (!loggedInProvider.getId().equals(providerId)) {
            throw new BadRequestException("You can only update your own profile");
        }

        ServiceProvider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        // Update fields
        if (dto.getEmail() != null && !dto.getEmail().equals(provider.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail()) || providerRepository.existsByEmail(dto.getEmail())) {
                throw new BadRequestException("Email is already taken");
            }
            provider.setEmail(dto.getEmail());
        }

        if (dto.getName() != null) provider.setName(dto.getName());
        if (dto.getPhone() != null) provider.setPhone(dto.getPhone());

        // --- GEOLOCATION LOGIC START ---
        boolean locationChanged = false;

        // Check if location is being updated
        if (dto.getLocation() != null) { 
             provider.setLocation(dto.getLocation());
             locationChanged = true;
        }
        
        // Update other fields
        if (dto.getServiceType() != null) provider.setServiceType(dto.getServiceType());
        if (dto.getExperienceYears() != null) provider.setExperienceYears(dto.getExperienceYears());
        if (dto.getServiceCost() != null) provider.setServiceCost(dto.getServiceCost());
        if (dto.getAvailability() != null) provider.setAvailability(dto.getAvailability());

        // Fetch coordinates if location changed
        if (locationChanged) {
            try {
                // Use the provider's location string to get lat/long
                double[] coords = getCoordinates(provider.getLocation());
                provider.setLatitude(coords[0]);
                provider.setLongitude(coords[1]);
                System.out.println("Coordinates updated: " + coords[0] + ", " + coords[1]);
            } catch (Exception e) {
                System.err.println("Failed to get coordinates: " + e.getMessage());
                // We continue saving even if geocoding fails so the text address is still saved
            }
        }
        // --- GEOLOCATION LOGIC END ---

        return providerRepository.save(provider);
    }

    public List<BookingDTO> viewBookings(Long providerId) {
        if (!providerRepository.existsById(providerId)) {
            throw new ResourceNotFoundException("Provider not found");
        }
        return bookingRepository.findByServiceProviderId(providerId)
                .stream()
                .map(this::mapBookingToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public BookingDTO updateBookingStatus(Long providerId, Long bookingId, BookingStatus status) {
    	// 👇 CHANGE THIS LINE to use your new custom method
    	Booking booking = bookingRepository.findBookingWithDetails(bookingId)
    	        .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getServiceProvider().getId().equals(providerId)) {
            throw new BadRequestException("This booking does not belong to you");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot change status of a completed or cancelled booking");
        }

        booking.setStatus(status);
        Booking savedBooking = bookingRepository.save(booking);

        // --- CRITICAL: Extract ALL data to primitives/Strings WHILE transaction is active ---
        // Force initialization of lazy-loaded entities by accessing all needed properties
        String userEmail = savedBooking.getUser().getEmail();
        String userName = savedBooking.getUser().getName();
        String providerName = savedBooking.getServiceProvider().getName();
        String serviceType = savedBooking.getServiceProvider().getServiceType();
        String date = savedBooking.getDateOfService().toString();
        String time = savedBooking.getTimeSlot();
        Long bId = savedBooking.getId();
        
        // Map to DTO while transaction is still active
        BookingDTO result = mapBookingToDTO(savedBooking);

        // --- Call the Email Service with only primitives/Strings (after transaction) ---
        if (status == BookingStatus.ACCEPTED) {
            emailService.sendBookingConfirmation(userEmail, userName, providerName, serviceType, date, time, bId);
        } else if (status == BookingStatus.REJECTED) {
            emailService.sendBookingRejection(userEmail, userName, providerName, serviceType, date, time, bId);
        }

        return result;
    }

    // --- NEW HELPER METHOD FOR GEOCODING ---
    private double[] getCoordinates(String address) {
        try {
            String url = String.format(
                "https://api.opencagedata.com/geocode/v1/json?q=%s&key=%s&limit=1",
                address, openCageApiKey
            );
            
            String jsonResponse = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode geometry = root.path("results").get(0).path("geometry");
            
            double lat = geometry.path("lat").asDouble();
            double lng = geometry.path("lng").asDouble();
            
            return new double[]{lat, lng};
        } catch (Exception e) {
            throw new RuntimeException("Could not geocode address");
        }
    }

    // --- Mappers ---
    private BookingDTO mapBookingToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setDateOfService(booking.getDateOfService());
        dto.setTimeSlot(booking.getTimeSlot());
        dto.setStatus(booking.getStatus());
        dto.setUserId(booking.getUser().getId());
        dto.setUserName(booking.getUser().getName());
        dto.setUserEmail(booking.getUser().getEmail());
        dto.setServiceProviderId(booking.getServiceProvider().getId());
        dto.setProviderName(booking.getServiceProvider().getName());
        
        // Add payment method
        if (booking.getPaymentMethod() != null) {
             dto.setPaymentMethod(booking.getPaymentMethod().name());
        }
        
        if (booking.getReview() != null) {
            dto.setReview(mapReviewToDTO(booking.getReview()));
        }
        return dto;
    }

    private ReviewDTO mapReviewToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setBookingId(review.getBooking().getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        return dto;
    }
}