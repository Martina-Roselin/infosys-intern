package com.app.servicefinder.controller;

import com.app.servicefinder.dto.BookingDTO;
import com.app.servicefinder.dto.ReviewDTO;
import com.app.servicefinder.dto.RegisterUserDTO;
import com.app.servicefinder.model.ServiceProvider;
import com.app.servicefinder.model.User;
import com.app.servicefinder.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    
    
 // ✅ GET ALL PROVIDERS
    @GetMapping("/providers")
    public ResponseEntity<List<ServiceProvider>> getAllProviders() {
        return ResponseEntity.ok(userService.getAllProviders());
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody RegisterUserDTO dto
    ) {
        User userPrincipal = (User) principal;
        User updatedUser = userService.updateProfile(userPrincipal.getId(), dto);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ServiceProvider>> searchProviders(
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String location
    ) {
        return ResponseEntity.ok(userService.searchProviders(serviceType, location));
    }
 // ... inside UserController class ...

    @GetMapping("/search/nearby")
    public ResponseEntity<List<ServiceProvider>> searchNearbyProviders(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radius,
            // 1. Add this new parameter to accept the service type
            @RequestParam(required = false, defaultValue = "") String serviceType 
    ) {
        // 2. Pass it to the service (now it has 4 arguments)
        return ResponseEntity.ok(userService.findNearbyProviders(lat, lng, radius, serviceType));
    }
    @GetMapping("/provider/{id}")
    public ResponseEntity<ServiceProvider> getProviderById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getProviderById(id));
    }

    @PostMapping("/book")
    public ResponseEntity<BookingDTO> bookSerrvice(
            @AuthenticationPrincipal User userPrincipal,
            @Valid @RequestBody BookingDTO bookingDTO
    ) {
        BookingDTO newBooking = userService.bookSerrvice(userPrincipal.getId(), bookingDTO);
        return new ResponseEntity<>(newBooking, HttpStatus.CREATED);
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDTO>> viewBookings(@AuthenticationPrincipal User userPrincipal) {
        return ResponseEntity.ok(userService.viewBookings(userPrincipal.getId()));
    }

    @PostMapping("/review")
    public ResponseEntity<ReviewDTO> submitReview(
            @AuthenticationPrincipal User userPrincipal,
            @Valid @RequestBody ReviewDTO reviewDTO
    ) {
        ReviewDTO newReview = userService.submitReview(userPrincipal.getId(), reviewDTO);
        return new ResponseEntity<>(newReview, HttpStatus.CREATED);
    }
}
