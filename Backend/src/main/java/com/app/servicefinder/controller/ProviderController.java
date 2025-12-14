package com.app.servicefinder.controller;

import com.app.servicefinder.dto.BookingDTO;
import com.app.servicefinder.dto.UpdateProviderProfileDTO;
import com.app.servicefinder.model.BookingStatus;
import com.app.servicefinder.model.ServiceProvider;
import com.app.servicefinder.service.ProviderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/provider")
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderService providerService;

    @PutMapping("/profile")
    public ResponseEntity<ServiceProvider> updateProfile(
            @AuthenticationPrincipal ServiceProvider providerPrincipal,
            @Valid @RequestBody UpdateProviderProfileDTO dto
    ) {
        ServiceProvider updatedProvider = providerService.updateProfile(providerPrincipal.getId(), dto);
        return ResponseEntity.ok(updatedProvider);
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDTO>> viewBookings(
            @AuthenticationPrincipal ServiceProvider providerPrincipal
    ) {
        return ResponseEntity.ok(providerService.viewBookings(providerPrincipal.getId()));
    }

    @PutMapping("/bookings/{bookingId}/status")
    public ResponseEntity<BookingDTO> updateBookingStatus(
            @AuthenticationPrincipal ServiceProvider providerPrincipal,
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> statusUpdate
    ) {
        // Simple request body: { "status": "ACCEPTED" }
        BookingStatus status = BookingStatus.valueOf(statusUpdate.get("status").toUpperCase());
        BookingDTO updatedBooking = providerService.updateBookingStatus(providerPrincipal.getId(), bookingId, status);
        return ResponseEntity.ok(updatedBooking);
    }
}
