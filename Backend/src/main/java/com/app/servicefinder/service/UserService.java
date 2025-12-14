package com.app.servicefinder.service;

import com.app.servicefinder.dto.BookingDTO;
import com.app.servicefinder.dto.ReviewDTO;
import com.app.servicefinder.dto.RegisterUserDTO;
import com.app.servicefinder.exception.BadRequestException;
import com.app.servicefinder.exception.ResourceNotFoundException;
import com.app.servicefinder.model.*;
import com.app.servicefinder.repository.BookingRepository;
import com.app.servicefinder.repository.ProviderRepository;
import com.app.servicefinder.repository.ReviewRepository;
import com.app.servicefinder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.app.servicefinder.model.PaymentMethod; // <-- ADD THIS IMPORT

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProviderRepository providerRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
   
    public User updateProfile(Long userId, RegisterUserDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if email is being changed and if new email is already taken
        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail()) || providerRepository.existsByEmail(dto.getEmail())) {
                throw new BadRequestException("Email is already taken");
            }
            user.setEmail(dto.getEmail());
        }

        if (dto.getName() != null) user.setName(dto.getName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getLocation() != null) user.setLocation(dto.getLocation());
        // Do not update password here, create a separate method for password change

        return userRepository.save(user);
    }
    
    public List<ServiceProvider> getAllProviders() {
        return providerRepository.findAll();
    }
    public List<ServiceProvider> findNearbyProviders(double lat, double lng, double radius, String serviceType) {
        // Ensure we don't pass null
        String typeFilter = (serviceType != null) ? serviceType : "";
        return providerRepository.findNearbyProviders(lat, lng, radius, typeFilter);
    }
    
    
    

    public List<ServiceProvider> searchProviders(String serviceType, String location) {
        if (serviceType != null && location != null) {
            return providerRepository.findByServiceTypeContainingIgnoreCaseAndLocationContainingIgnoreCase(serviceType, location);
        } else if (serviceType != null) {
            return providerRepository.findByServiceTypeContainingIgnoreCase(serviceType);
        } else if (location != null) {
            return providerRepository.findByLocationContainingIgnoreCase(location);
        } else {
            return providerRepository.findAll();
        }
    }

    public ServiceProvider getProviderById(Long id) {
        return providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service Provider not found with id: " + id));
    }

    public BookingDTO bookSerrvice(Long userId, BookingDTO bookingDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        ServiceProvider provider = providerRepository.findById(bookingDTO.getServiceProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Service Provider not found"));

        Booking booking = Booking.builder()
                .user(user)
                .serviceProvider(provider)
                .dateOfService(bookingDTO.getDateOfService())
                .timeSlot(bookingDTO.getTimeSlot())
                .status(BookingStatus.PENDING)
             // --- ADD THIS LINE ---
                .paymentMethod(PaymentMethod.valueOf(bookingDTO.getPaymentMethod().toUpperCase()))
                // -------------------
                .build();

        Booking savedBooking = bookingRepository.save(booking);
     
        // ---------------------------------
        return mapBookingToDTO(savedBooking);
    }

    public List<BookingDTO> viewBookings(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::mapBookingToDTO)
                .collect(Collectors.toList());
    }

    public ReviewDTO submitReview(Long userId, ReviewDTO reviewDTO) {
        Booking booking = bookingRepository.findByIdAndUserId(reviewDTO.getBookingId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found or does not belong to user"));

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot review a booking that is not completed");
        }

        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new BadRequestException("A review for this booking already exists");
        }

        Review review = Review.builder()
                .booking(booking)
                .rating(reviewDTO.getRating())
                .comment(reviewDTO.getComment())
                .build();
        
        Review savedReview = reviewRepository.save(review);
        return mapReviewToDTO(savedReview);
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
        dto.setServiceProviderId(booking.getServiceProvider().getId());
        dto.setProviderName(booking.getServiceProvider().getName());
     // --- ADD THIS LINE ---
        dto.setPaymentMethod(booking.getPaymentMethod().name()); // .name() converts enum to String
        // -------------------
        
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
