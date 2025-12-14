package com.app.servicefinder.service;

import com.app.servicefinder.dto.ProviderDTO;
import com.app.servicefinder.dto.UserDTO;
import com.app.servicefinder.exception.ResourceNotFoundException;
import com.app.servicefinder.repository.ProviderRepository;
import com.app.servicefinder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProviderRepository providerRepository;

    // ✅ Return users as DTOs
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserDTO(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getPhone(),
                        user.getLocation(),
                        user.getRole().name()
                ))
                .toList();
    }

    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }

    // (Providers kept as entities for now — can be converted to DTO later)
    public List<ProviderDTO> getAllProviders() {
        return providerRepository.findAll().stream()
                .map(provider -> new ProviderDTO(
                        provider.getId(),
                        provider.getName(),
                        provider.getEmail(),
                        provider.getPhone(),
                        provider.getServiceType(),
                        provider.getExperienceYears(),
                        provider.getServiceCost(),
                        provider.getLocation(),
                        provider.getAvailability(),
                        provider.getRole().name()
                ))
                .toList();
    }
    public void deleteProvider(Long providerId) {
        if (!providerRepository.existsById(providerId)) {
            throw new ResourceNotFoundException("Provider not found with id: " + providerId);
        }
        providerRepository.deleteById(providerId);
    }
}
