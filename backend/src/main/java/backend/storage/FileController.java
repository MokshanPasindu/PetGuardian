package backend.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final StorageService storageService;

    @GetMapping("/{folder}/{filename:.+}")
    public ResponseEntity<Resource> serveFile(
            @PathVariable String folder,
            @PathVariable String filename) {
        try {
            String fullPath = folder + "/" + filename;
            log.info("Serving file: {}", fullPath);

            byte[] data = storageService.load(fullPath);
            ByteArrayResource resource = new ByteArrayResource(data);

            String contentType = determineContentType(filename);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                    .body(resource);

        } catch (Exception e) {
            log.error("Error serving file: {}/{}", folder, filename, e);
            return ResponseEntity.notFound().build();
        }
    }

    private String determineContentType(String filename) {
        String lowercaseFilename = filename.toLowerCase();

        if (lowercaseFilename.endsWith(".png")) return "image/png";
        if (lowercaseFilename.endsWith(".jpg") || lowercaseFilename.endsWith(".jpeg")) return "image/jpeg";
        if (lowercaseFilename.endsWith(".gif")) return "image/gif";
        if (lowercaseFilename.endsWith(".webp")) return "image/webp";
        if (lowercaseFilename.endsWith(".svg")) return "image/svg+xml";
        if (lowercaseFilename.endsWith(".pdf")) return "application/pdf";

        return "application/octet-stream";
    }
}