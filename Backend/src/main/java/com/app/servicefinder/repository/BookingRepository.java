package com.app.servicefinder.repository;

import com.app.servicefinder.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query; // Import this
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
	// --- FIX IS HERE: Add @Query with JOIN FETCH ---
	// 1. Fetch Bookings for Provider (Loads User & Review data instantly)
    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.serviceProvider " +
           "LEFT JOIN FETCH b.review " +
           "WHERE b.serviceProvider.id = :providerId " +
           "ORDER BY b.dateOfService DESC")
    List<Booking> findByServiceProviderId(@Param("providerId") Long providerId);

    // 2. Fetch Bookings for User (Loads Provider & Review data instantly)
    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.serviceProvider " +
           "LEFT JOIN FETCH b.review " +
           "WHERE b.user.id = :userId " +
           "ORDER BY b.dateOfService DESC")
    List<Booking> findByUserId(@Param("userId") Long userId);
 // 👇 ADD THIS NEW METHOD to fetch a SINGLE booking with all details
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user " +
           "JOIN FETCH b.serviceProvider " +
           "LEFT JOIN FETCH b.review " +
           "WHERE b.id = :id")
    java.util.Optional<Booking> findBookingWithDetails(@Param("id") Long id);
    // For checking review eligibility
    Optional<Booking> findByIdAndUserId(Long id, Long userId);
    @Query("""
    		SELECT b FROM Booking b
    		JOIN FETCH b.user
    		JOIN FETCH b.serviceProvider
    		LEFT JOIN FETCH b.review
    		ORDER BY b.dateOfService DESC
    		""")
    		List<Booking> findAllWithDetails();

}
