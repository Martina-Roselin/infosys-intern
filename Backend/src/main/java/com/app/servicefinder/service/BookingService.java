package com.app.servicefinder.service;

import com.app.servicefinder.dto.BookingDTO;
import com.app.servicefinder.dto.ReviewDTO;
import com.app.servicefinder.model.Booking;
import com.app.servicefinder.model.Review;
import com.app.servicefinder.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * A central service for bookings, primarily for Admin use.
 * User and Provider services handle their own booking logic.
 */
@Service
@RequiredArgsConstructor
public class BookingService {
    
    private final BookingRepository bookingRepository;

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAllWithDetails()
                .stream()
                .map(this::mapBookingToDTO)
                .collect(Collectors.toList());
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
        dto.setProviderEmail(booking.getServiceProvider().getEmail());

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
