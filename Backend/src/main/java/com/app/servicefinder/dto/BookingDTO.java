package com.app.servicefinder.dto;

import com.app.servicefinder.model.BookingStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * A multi-purpose DTO.
 * Used for creating a booking (by User).
 * Used for viewing a booking (by User, Provider, Admin).
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL) // Don't show null fields in JSON
public class BookingDTO {
    
    // Fields for Viewing
    private Long id;
    private BookingStatus status;
    private String userName;
    private String userEmail;
    private String providerName;
    private String providerEmail;
 // --- ADD THIS NEW FIELD ---
    private String paymentMethod;
    // --------------------------
    private ReviewDTO review; // Show review if it exists

    // Fields for Creating (and Viewing)
    @NotNull(message = "Provider ID is required for booking")
    private Long serviceProviderId;
    
    // User ID is not needed for creation (comes from security context)
    // but is useful for viewing (e.g., for Admin)
    private Long userId;

    @NotNull(message = "Date of service is required")
    @FutureOrPresent(message = "Booking date must be in the present or future")
    private LocalDate dateOfService;

    @NotNull(message = "Time slot is required")
    private String timeSlot;
}
