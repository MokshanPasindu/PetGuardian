package backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final StringToPetTypeConverter stringToPetTypeConverter;

    public WebConfig(StringToPetTypeConverter stringToPetTypeConverter) {
        this.stringToPetTypeConverter = stringToPetTypeConverter;
    }

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(stringToPetTypeConverter);
    }
}