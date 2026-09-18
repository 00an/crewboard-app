package be.ucll.se.courses.backend.controller.dto;

import jakarta.validation.constraints.NotBlank;

public record UrlValidateRequest(@NotBlank String url) {}
