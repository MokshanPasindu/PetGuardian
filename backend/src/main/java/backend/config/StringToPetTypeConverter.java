package backend.config;

import backend.pet.model.PetType;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToPetTypeConverter implements Converter<String, PetType> {

    @Override
    public PetType convert(String source) {
        if (source == null || source.trim().isEmpty()) {
            return null;
        }
        try {
            return PetType.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid pet type: " + source +
                    ". Valid values are: DOG, CAT, BIRD");
        }
    }
}