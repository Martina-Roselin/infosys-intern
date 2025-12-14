package com.app.servicefinder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtAuthResponseDTO {
    private String token;
    private String role;
    private String name;
    private Long id;
}
