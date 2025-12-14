package com.app.servicefinder.service;

import com.app.servicefinder.model.Admin;
import com.app.servicefinder.model.ServiceProvider;
import com.app.servicefinder.model.User;
import com.app.servicefinder.repository.AdminRepository;
import com.app.servicefinder.repository.ProviderRepository;
import com.app.servicefinder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final ProviderRepository providerRepository;
    private final AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        Admin admin = adminRepository.findByEmail(email).orElse(null);
        if (admin != null) return admin;

        ServiceProvider provider = providerRepository.findByEmail(email).orElse(null);
        if (provider != null) return provider;

        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) return user;

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}
