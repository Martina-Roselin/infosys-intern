package com.app.servicefinder.controller;

import com.app.servicefinder.dto.JwtAuthResponseDTO;
import com.app.servicefinder.dto.LoginRequestDTO;
import com.app.servicefinder.dto.RegisterProviderDTO;
import com.app.servicefinder.dto.RegisterUserDTO;
import com.app.servicefinder.model.ServiceProvider;
import com.app.servicefinder.model.User;
import com.app.servicefinder.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/user")
    public ResponseEntity<User> registerUser(@Valid @RequestBody RegisterUserDTO dto) {
        User newUser = authService.registerUser(dto);
        return new ResponseEntity<>(newUser, HttpStatus.CREATED);
    }

    @PostMapping("/register/provider")
    public ResponseEntity<ServiceProvider> registerProvider(@Valid @RequestBody RegisterProviderDTO dto) {
        ServiceProvider newProvider = authService.registerProvider(dto);
        return new ResponseEntity<>(newProvider, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        JwtAuthResponseDTO response = authService.login(dto);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/login/admin")
    public ResponseEntity<JwtAuthResponseDTO> loginAdmin(@Valid @RequestBody LoginRequestDTO dto) {
        JwtAuthResponseDTO response = authService.loginAdmin(dto);
        return ResponseEntity.ok(response);
    }

}
