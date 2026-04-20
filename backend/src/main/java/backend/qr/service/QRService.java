package backend.qr.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import backend.common.exception.ResourceNotFoundException;
import backend.pet.model.Pet;
import backend.pet.repository.PetRepository;
import backend.qr.dto.PublicPetProfileDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
public class QRService {

    private final PetRepository petRepository;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public PublicPetProfileDTO getPublicPetProfile(String qrCode) {
        Pet pet = petRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        return PublicPetProfileDTO.builder()
                .id(pet.getId())
                .name(pet.getName())
                .type(pet.getType().name().toLowerCase())
                .breed(pet.getBreed())
                .gender(pet.getGender())
                .color(pet.getColor())
                .image(pet.getImage())
                .age(calculateAge(pet.getBirthDate()))
                .microchipId(pet.getMicrochipId())
                .medicalNotes(pet.getNotes())
                .owner(PublicPetProfileDTO.OwnerContactDTO.builder()
                        .name(pet.getOwner().getFullName())
                        .phone(pet.getOwner().getPhone())
                        .email(pet.getOwner().getEmail())
                        .area(pet.getOwner().getAddress())
                        .build())
                .build();
    }

    public byte[] generateQRCode(String qrCode, int width, int height) throws WriterException, IOException {
        String url = frontendUrl + "/pet/" + qrCode;

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(url, BarcodeFormat.QR_CODE, width, height);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

        return outputStream.toByteArray();
    }

    private String calculateAge(LocalDate birthDate) {
        if (birthDate == null) {
            return "Unknown";
        }

        Period period = Period.between(birthDate, LocalDate.now());
        int years = period.getYears();
        int months = period.getMonths();

        if (years > 0) {
            return years + " year" + (years > 1 ? "s" : "") +
                    (months > 0 ? " " + months + " month" + (months > 1 ? "s" : "") : "");
        }
        return months + " month" + (months > 1 ? "s" : "");
    }
}