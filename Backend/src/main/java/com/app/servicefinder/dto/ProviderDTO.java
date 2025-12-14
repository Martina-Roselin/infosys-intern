package com.app.servicefinder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProviderDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String serviceType;
    private int experienceYears;
    private BigDecimal serviceCost;
    private String location;
    private String availability;
    private String role;
}
