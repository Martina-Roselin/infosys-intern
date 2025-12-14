package com.app.servicefinder.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateProviderProfileDTO {

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Service type is required")
    private String serviceType;

    private String phone;
    private Integer experienceYears;
    private BigDecimal serviceCost;
    private String location;
    private String availability;
}
