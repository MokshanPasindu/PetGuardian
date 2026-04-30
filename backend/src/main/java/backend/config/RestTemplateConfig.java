// backend/config/RestTemplateConfig.java
// REMOVE the ObjectMapper bean — use @Primary or inject existing one

package backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Value("${ai.flask.timeout:30000}")
    private int readTimeout;

    @Value("${ai.flask.connect-timeout:5000}")
    private int connectTimeout;

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory =
                new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeout);
        factory.setReadTimeout(readTimeout);
        return new RestTemplate(factory);
    }

    // ❌ REMOVE THIS — it conflicts with Spring's auto-configured ObjectMapper
    // @Bean
    // public ObjectMapper objectMapper() {
    //     return new ObjectMapper();
    // }
}