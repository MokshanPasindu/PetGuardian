// backend/common/exception/ResourceNotFoundException.java
package backend.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    // ── Constructor 1: simple message ─────────────────────────────────────────
    // Used by: BreedController, BreedService
    // Example: new ResourceNotFoundException("User not found with email: john@example.com")
    public ResourceNotFoundException(String message) {
        super(message);
    }

    // ── Constructor 2: field-based message ────────────────────────────────────
    // Kept for compatibility with other services that may use this pattern
    // Example: new ResourceNotFoundException("User", "id", 42)
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }
}