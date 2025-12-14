package com.app.servicefinder.service;

import com.app.servicefinder.config.JwtTokenUtil;
import com.app.servicefinder.dto.JwtAuthResponseDTO;
import com.app.servicefinder.dto.LoginRequestDTO;
import com.app.servicefinder.dto.RegisterProviderDTO;
import com.app.servicefinder.dto.RegisterUserDTO;
import com.app.servicefinder.exception.BadRequestException;
import com.app.servicefinder.model.Admin;
import com.app.servicefinder.model.Role;
import com.app.servicefinder.model.ServiceProvider;
import com.app.servicefinder.model.User;
import com.app.servicefinder.repository.AdminRepository;
import com.app.servicefinder.repository.ProviderRepository;
import com.app.servicefinder.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ProviderRepository providerRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final AuthenticationManager authenticationManager;

    public User registerUser(RegisterUserDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail()) || providerRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email is already taken!");
        }

        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .phone(dto.getPhone())
                .location(dto.getLocation())
                .role(Role.ROLE_USER)
                .build();

        return userRepository.save(user);
    }

    public ServiceProvider registerProvider(RegisterProviderDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail()) || providerRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email is already taken!");
        }

        ServiceProvider provider = ServiceProvider.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .phone(dto.getPhone())
                .serviceType(dto.getServiceType())
                .experienceYears(dto.getExperienceYears())
                .serviceCost(dto.getServiceCost())
                .location(dto.getLocation())
                .availability(dto.getAvailability())
                .role(Role.ROLE_PROVIDER)
                .build();

        return providerRepository.save(provider);
    }

    public JwtAuthResponseDTO login(LoginRequestDTO dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtTokenUtil.generateToken(userDetails);

        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        String name = "";
        Long id = null;

        if (userDetails instanceof User user) {
            name = user.getName();
            id = user.getId();
        } else if (userDetails instanceof ServiceProvider provider) {
            name = provider.getName();
            id = provider.getId();
        } else if (userDetails instanceof Admin admin) {
            name = admin.getUsername();
            id = admin.getId();
        }

        return new JwtAuthResponseDTO(token, role, name, id);
    }

    public JwtAuthResponseDTO loginAdmin(@Valid LoginRequestDTO dto) {
        JwtAuthResponseDTO response = login(dto);
        if (!"ROLE_ADMIN".equals(response.getRole())) {
            throw new BadRequestException("Unauthorized: Not an admin");
        }
        return response;
    }
}
