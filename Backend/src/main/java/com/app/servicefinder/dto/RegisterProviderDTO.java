package com.app.servicefinder.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RegisterProviderDTO {
    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    @NotBlank(message = "Service type is required")
    private String serviceType;

    private String phone;

    @Min(value = 0, message = "Experience cannot be negative")
    private int experienceYears;

    @Min(value = 0, message = "Service cost cannot be negative")
    private BigDecimal serviceCost;

    private String location;
    private String availability;
}
