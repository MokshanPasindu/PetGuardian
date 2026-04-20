package backend.qr.controller;


import com.google.zxing.WriterException;
import backend.qr.dto.PublicPetProfileDTO;
import backend.qr.service.QRService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/qr")
@RequiredArgsConstructor
@Tag(name = "QR Code", description = "QR code and public pet profile APIs")
public class QRController {

    private final QRService qrService;

    @GetMapping("/pet/{qrCode}")
    @Operation(summary = "Get public pet profile by QR code")
    public ResponseEntity<PublicPetProfileDTO> getPublicPetProfile(@PathVariable String qrCode) {
        return ResponseEntity.ok(qrService.getPublicPetProfile(qrCode));
    }

    @GetMapping(value = "/generate/{qrCode}", produces = MediaType.IMAGE_PNG_VALUE)
    @Operation(summary = "Generate QR code image")
    public ResponseEntity<byte[]> generateQRCode(
            @PathVariable String qrCode,
            @RequestParam(defaultValue = "300") int width,
            @RequestParam(defaultValue = "300") int height) {
        try {
            byte[] qrImage = qrService.generateQRCode(qrCode, width, height);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentLength(qrImage.length);

            return new ResponseEntity<>(qrImage, headers, HttpStatus.OK);
        } catch (WriterException | IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}