package com.app.servicefinder.repository;

import com.app.servicefinder.model.ServiceProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderRepository extends JpaRepository<ServiceProvider, Long> {
    Optional<ServiceProvider> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // For search: finds if service type or location contains the query string (case-insensitive)
    List<ServiceProvider> findByServiceTypeContainingIgnoreCaseAndLocationContainingIgnoreCase(String serviceType, String location);
    List<ServiceProvider> findByServiceTypeContainingIgnoreCase(String serviceType);
    List<ServiceProvider> findByLocationContainingIgnoreCase(String location);
 // --- ADD THIS GEO-SEARCH METHOD ---
    @Query(value = 
            "SELECT *, ( 6371 * acos( cos( radians(:lat) ) * cos( radians( latitude ) ) " +
            "* cos( radians( longitude ) - radians(:lng) ) + sin( radians(:lat) ) " +
            "* sin( radians( latitude ) ) ) ) AS distance " +
            "FROM service_providers " +
            "WHERE latitude IS NOT NULL " +
            "AND (:serviceType = '' OR LOWER(service_type) LIKE LOWER(CONCAT('%', :serviceType, '%'))) " + // <--- THIS LINE IS CRITICAL
            "HAVING distance < :radius " +
            "ORDER BY distance", 
            nativeQuery = true)
        List<ServiceProvider> findNearbyProviders(
            @Param("lat") double lat, 
            @Param("lng") double lng, 
            @Param("radius") double radius,
            @Param("serviceType") String serviceType
        );
}