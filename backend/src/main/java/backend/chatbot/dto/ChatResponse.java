// backend/chatbot/dto/ChatResponse.java
// UPDATED — keeps existing fields, adds suggestVet

package backend.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {

    // ── Existing fields (unchanged) ────────────────────────
    private Long          id;
    private String        message;
    private boolean       isBot;
    private LocalDateTime timestamp;

    // ── New field for Vet Connect trigger ─────────────────
    private boolean suggestVet;
}