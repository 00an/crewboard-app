package be.ucll.se.courses.backend.controller;

import be.ucll.se.courses.backend.controller.dto.UrlValidateRequest;
import be.ucll.se.courses.backend.service.UrlValidationService;

import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/url-validate")
@Tag(
        name = "URL Validation",
        description = "SSRF-safe URL validation — checks whether a URL would be safe to fetch, without ever fetching it"
)
public class UrlValidationController {

    private final UrlValidationService service;

    public UrlValidationController(UrlValidationService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(
            summary = "Validate a URL against SSRF protections",
            description = "Returns 'allow' or 'reject' based on scheme, port, hostname, and resolved-IP checks. The URL is never actually fetched."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Validation result returned")
    })
    public UrlValidationService.UrlValidationResult validate(@Valid @RequestBody UrlValidateRequest request) {
        return service.validate(request.url());
    }
}