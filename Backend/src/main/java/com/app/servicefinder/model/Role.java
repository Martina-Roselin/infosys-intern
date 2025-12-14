package com.app.servicefinder.model;

/**
 * Defines the roles in the system.
 * Spring Security will automatically prefix "ROLE_"
 */
public enum Role {
    ROLE_USER,
    ROLE_PROVIDER,
    ROLE_ADMIN
}
