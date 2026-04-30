// backend/chatbot/service/ChatbotService.java
// CHANGE — inject ObjectMapper instead of creating new bean

package backend.chatbot.service;

import backend.chatbot.dto.ChatRequest;
import backend.chatbot.dto.ChatResponse;
import backend.chatbot.model.ChatMessage;
import backend.chatbot.repository.ChatHistoryRepository;
import backend.user.model.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final ChatHistoryRepository chatHistoryRepository;
    private final RestTemplate          restTemplate;

    // ✅ Inject Spring's existing ObjectMapper — don't create a new bean
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url:}")
    private String geminiApiUrl;

    // ── System prompt ──────────────────────────────────────
    private static final String SYSTEM_PROMPT = """
        You are PetGuardian Assistant, a helpful and caring AI chatbot
        for the PetGuardian pet health management platform.

        YOUR ROLE:
        - Help pet owners understand their pet's symptoms
        - Provide general pet care advice and tips
        - Give preliminary guidance on common pet health issues
        - Suggest when to visit a veterinarian
        - Answer questions about pet nutrition, behavior, and wellness
        - Guide users to use platform features (AI Scanner, Vet Connect,
          Health Passport)

        IMPORTANT RULES (MUST FOLLOW):
        1. You are NOT a veterinarian — cannot diagnose diseases
        2. Always recommend seeing a real vet for serious symptoms
        3. Keep responses clear, friendly, and easy to understand
        4. Use emojis occasionally to be friendly
        5. If symptoms sound severe/urgent, strongly recommend
           IMMEDIATE veterinary care
        6. Never prescribe medications or specific dosages
        7. Be empathetic — pet owners are often worried

        SEVERITY DETECTION — If user mentions any of these,
        strongly urge immediate vet visit:
        bleeding, difficulty breathing, seizures, collapse,
        severe vomiting, severe diarrhea, not eating 2+ days,
        extreme lethargy, swollen face, suspected poisoning,
        cannot walk, unconscious, convulsions

        PLATFORM FEATURES TO MENTION WHEN RELEVANT:
        - AI Skin Scanner: for skin conditions and rashes
        - Vet Connect: to find nearby veterinary clinics
        - Health Passport: to track medical records
        - Vaccination tracker: for vaccine schedules

        RESPONSE FORMAT:
        - Concise and clear (3-5 sentences for simple questions)
        - Use bullet points for lists
        - Always warm and supportive
        - End with disclaimer that you are an AI, not a vet
        """;

    // ═══════════════════════════════════════════════════════
    // MAIN METHOD
    // ═══════════════════════════════════════════════════════

    @Transactional
    public ChatResponse sendMessage(ChatRequest request, User user) {
        log.info("Processing message from user {}: {}",
                user.getId(), request.getMessage());

        String userMessage = request.getMessage().trim();

        // Save user message
        ChatMessage userMsg = ChatMessage.builder()
                .content(userMessage)
                .isBot(false)
                .user(user)
                .build();
        chatHistoryRepository.save(userMsg);

        // Get recent history for context (last 8 messages)
        List<ChatMessage> history = getRecentHistory(user, 8);

        // Generate response
        String  botContent;
        boolean suggestVet = false;

        if (isGeminiConfigured()) {
            try {
                botContent = callGeminiAPI(userMessage, history);
                suggestVet = shouldSuggestVet(userMessage, botContent);

                if (suggestVet) {
                    botContent += "\n\n🏥 **Find a Vet Now:** Use our " +
                            "Vet Connect feature to locate nearby " +
                            "veterinary clinics immediately.";
                }

            } catch (Exception e) {
                log.error("Gemini API failed: {}", e.getMessage());
                botContent = getFallbackResponse(userMessage);
                suggestVet = isUrgent(userMessage);
            }
        } else {
            log.warn("Gemini not configured — using keyword fallback");
            botContent = getFallbackResponse(userMessage);
            suggestVet = isUrgent(userMessage);
        }

        // Save bot message
        ChatMessage botMsg = ChatMessage.builder()
                .content(botContent)
                .isBot(true)
                .user(user)
                .build();
        ChatMessage saved = chatHistoryRepository.save(botMsg);

        log.info("Response generated for user {}", user.getId());

        return ChatResponse.builder()
                .id(saved.getId())
                .message(saved.getContent())
                .isBot(true)
                .suggestVet(suggestVet)
                .timestamp(saved.getCreatedAt())
                .build();
    }

    // ═══════════════════════════════════════════════════════
    // HISTORY
    // ═══════════════════════════════════════════════════════

    public List<ChatResponse> getChatHistory(User user) {
        List<ChatMessage> messages =
                chatHistoryRepository
                        .findTop50ByUserIdOrderByCreatedAtDesc(
                                user.getId());
        Collections.reverse(messages);

        return messages.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void clearHistory(User user) {
        log.info("Clearing chat history for user {}", user.getId());
        chatHistoryRepository.deleteByUserId(user.getId());
    }

    // ═══════════════════════════════════════════════════════
    // GEMINI API
    // ═══════════════════════════════════════════════════════

    private String callGeminiAPI(
            String userMessage,
            List<ChatMessage> history
    ) throws Exception {

        String url = geminiApiUrl + "?key=" + geminiApiKey;

        ObjectNode body     = objectMapper.createObjectNode();
        ArrayNode  contents = body.putArray("contents");

        // System context
        ObjectNode sysUser = contents.addObject();
        sysUser.put("role", "user");
        sysUser.putArray("parts")
                .addObject()
                .put("text", SYSTEM_PROMPT);

        ObjectNode sysModel = contents.addObject();
        sysModel.put("role", "model");
        sysModel.putArray("parts")
                .addObject()
                .put("text",
                        "Understood! I am PetGuardian Assistant. " +
                                "I will provide helpful pet care guidance " +
                                "while always recommending professional " +
                                "veterinary care when needed.");

        // Conversation history
        for (ChatMessage msg : history) {
            ObjectNode msgNode = contents.addObject();
            msgNode.put("role", msg.isBot() ? "model" : "user");
            msgNode.putArray("parts")
                    .addObject()
                    .put("text", msg.getContent());
        }

        // Current message
        ObjectNode curMsg = contents.addObject();
        curMsg.put("role", "user");
        curMsg.putArray("parts")
                .addObject()
                .put("text", userMessage);

        // Generation config
        ObjectNode genConfig = body.putObject("generationConfig");
        genConfig.put("temperature",     0.7);
        genConfig.put("maxOutputTokens", 800);
        genConfig.put("topP",            0.8);
        genConfig.put("topK",            40);

        // HTTP call
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(
                objectMapper.writeValueAsString(body), headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, String.class);

        return parseGeminiResponse(response.getBody());
    }

    private String parseGeminiResponse(String body) throws Exception {
        JsonNode root       = objectMapper.readTree(body);
        JsonNode candidates = root.path("candidates");

        if (candidates.isEmpty()) {
            log.warn("Gemini returned empty candidates");
            return getDefaultFallback();
        }

        JsonNode text = candidates
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text");

        if (text.isMissingNode() || text.asText().isBlank()) {
            return getDefaultFallback();
        }

        return text.asText().trim();
    }

    // ═══════════════════════════════════════════════════════
    // VET SUGGESTION DETECTION
    // ═══════════════════════════════════════════════════════

    private boolean shouldSuggestVet(String msg, String reply) {
        String combined = (msg + " " + reply).toLowerCase();

        String[] vetPhrases = {
                "see a vet", "visit a vet", "consult a vet",
                "veterinarian", "veterinary care", "medical attention",
                "vet immediately", "vet as soon", "professional help",
                "emergency vet", "animal hospital"
        };

        for (String phrase : vetPhrases) {
            if (combined.contains(phrase)) return true;
        }

        return isUrgent(msg);
    }

    private boolean isUrgent(String msg) {
        String lower = msg.toLowerCase();

        String[] urgentWords = {
                "bleeding", "seizure", "collapse", "unconscious",
                "can't breathe", "difficulty breathing", "not breathing",
                "swollen", "poisoned", "poison", "emergency",
                "vomiting blood", "diarrhea blood", "not moving",
                "paralyzed", "broken", "hit by car",
                "ate something", "swallowed"
        };

        for (String word : urgentWords) {
            if (lower.contains(word)) return true;
        }
        return false;
    }

    // ═══════════════════════════════════════════════════════
    // FALLBACK KEYWORD RESPONSES
    // ═══════════════════════════════════════════════════════

    private String getFallbackResponse(String message) {
        String lower = message.toLowerCase();

        if (lower.matches(".*(hello|hi|hey|good morning|good afternoon).*")) {
            return "Hello! 👋 I'm **PetGuardian Assistant**.\n\n" +
                    "I can help you with:\n" +
                    "✅ Skin condition concerns\n" +
                    "✅ Vaccination schedules\n" +
                    "✅ Nutrition and diet advice\n" +
                    "✅ Finding nearby vets\n\n" +
                    "How can I help your pet today? 🐾\n\n" +
                    "⚠️ I'm an AI assistant, not a veterinarian.";
        }

        if (isUrgent(lower)) {
            return "🚨 **This sounds like an emergency!**\n\n" +
                    "Please seek **immediate veterinary care**.\n\n" +
                    "**Steps:**\n" +
                    "1. Stay calm\n" +
                    "2. Call your vet or emergency clinic NOW\n" +
                    "3. Use **Vet Connect** to find nearest clinic\n\n" +
                    "⚠️ I'm an AI assistant. " +
                    "Call a vet immediately!";
        }

        if (lower.matches(
                ".*(skin|rash|itch|scratch|red|spot|bump|scab).*")) {
            return "🔍 **Skin Concerns in Pets:**\n\n" +
                    "Common causes:\n" +
                    "• Allergies (food or environmental)\n" +
                    "• Parasites (fleas, mites)\n" +
                    "• Fungal or bacterial infections\n\n" +
                    "**Actions:**\n" +
                    "1. Use our **AI Skin Scanner**\n" +
                    "2. Consult a vet if symptoms worsen\n\n" +
                    "⚠️ I'm an AI assistant, not a veterinarian.";
        }

        if (lower.matches(
                ".*(vaccine|vaccination|shot|immunization|booster).*")) {
            return "💉 **Vaccination Guide:**\n\n" +
                    "**Dogs:** DHPP, Rabies, Bordetella\n" +
                    "**Cats:** FVRCP, Rabies, FeLV\n\n" +
                    "Check your pet's **Health Passport** " +
                    "for their schedule!\n\n" +
                    "⚠️ I'm an AI assistant, not a veterinarian.";
        }

        if (lower.matches(
                ".*(food|diet|eat|feed|nutrition|meal).*")) {
            return "🍖 **Pet Nutrition:**\n\n" +
                    "**NEVER GIVE:**\n" +
                    "❌ Chocolate, grapes, onions, xylitol\n\n" +
                    "**Good Practices:**\n" +
                    "• High-quality protein\n" +
                    "• Age-appropriate food\n" +
                    "• Fresh water always available\n\n" +
                    "⚠️ I'm an AI assistant, not a veterinarian.";
        }

        if (lower.matches(
                ".*(vet|clinic|doctor|hospital|appointment).*")) {
            return "🏥 **Finding Veterinary Care:**\n\n" +
                    "Use **Vet Connect** to:\n" +
                    "• Find nearby clinics\n" +
                    "• Check availability\n" +
                    "• Book appointments\n\n" +
                    "⚠️ I'm an AI assistant, not a veterinarian.";
        }

        return getDefaultFallback();
    }

    private String getDefaultFallback() {
        return "🐾 I'm here to help with pet care questions!\n\n" +
                "I can assist with:\n" +
                "• Health concerns and symptoms\n" +
                "• Nutrition and diet\n" +
                "• Vaccination schedules\n" +
                "• Finding nearby vets\n\n" +
                "What would you like to know? 🐾\n\n" +
                "⚠️ I'm an AI assistant, not a veterinarian.";
    }

    // ═══════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════

    private boolean isGeminiConfigured() {
        return geminiApiKey != null
                && !geminiApiKey.isBlank()
                && !geminiApiKey.equals("YOUR_GEMINI_API_KEY_HERE")
                && geminiApiUrl != null
                && !geminiApiUrl.isBlank();
    }

    private List<ChatMessage> getRecentHistory(User user, int limit) {
        List<ChatMessage> all =
                chatHistoryRepository
                        .findByUserIdOrderByCreatedAtAsc(user.getId());
        int size  = all.size();
        int start = Math.max(0, size - limit);
        return all.subList(start, size);
    }

    private ChatResponse mapToResponse(ChatMessage message) {
        return ChatResponse.builder()
                .id(message.getId())
                .message(message.getContent())
                .isBot(message.isBot())
                .suggestVet(false)
                .timestamp(message.getCreatedAt())
                .build();
    }
}