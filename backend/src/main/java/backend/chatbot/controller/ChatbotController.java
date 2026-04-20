package backend.chatbot.controller;

import backend.chatbot.dto.ChatRequest;
import backend.chatbot.dto.ChatResponse;
import backend.chatbot.service.ChatbotService;
import backend.common.dto.ApiResponse;
import backend.user.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
@Tag(name = "Chatbot", description = "AI-powered chatbot for pet care assistance")
@SecurityRequirement(name = "Bearer Authentication")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/message")
    @Operation(summary = "Send message to chatbot", description = "Send a message and receive AI response")
    public ResponseEntity<ChatResponse> sendMessage(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal User user
    ) {
        ChatResponse response = chatbotService.sendMessage(request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    @Operation(summary = "Get chat history", description = "Retrieve recent chat messages")
    public ResponseEntity<List<ChatResponse>> getChatHistory(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "50") int limit
    ) {
        List<ChatResponse> history = chatbotService.getChatHistory(user);
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/history")
    @Operation(summary = "Clear chat history", description = "Delete all chat messages for current user")
    public ResponseEntity<ApiResponse> clearHistory(@AuthenticationPrincipal User user) {
        chatbotService.clearHistory(user);
        return ResponseEntity.ok(new ApiResponse(true, "Chat history cleared successfully"));
    }

    @GetMapping("/health")
    @Operation(summary = "Chatbot health check", description = "Check if chatbot service is running")
    public ResponseEntity<ApiResponse> healthCheck() {
        return ResponseEntity.ok(new ApiResponse(true, "Chatbot service is running"));
    }
}