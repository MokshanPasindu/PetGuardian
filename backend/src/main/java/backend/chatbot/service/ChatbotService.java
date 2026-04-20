package backend.chatbot.service;

import backend.chatbot.dto.ChatRequest;
import backend.chatbot.dto.ChatResponse;
import backend.chatbot.model.ChatMessage;
import backend.chatbot.repository.ChatHistoryRepository;
import backend.user.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final ChatHistoryRepository chatHistoryRepository;

    // Enhanced knowledge base with multiple keywords
    private static final Map<String, ResponseTemplate> KNOWLEDGE_BASE = new HashMap<>();

    static {
        KNOWLEDGE_BASE.put("greeting", new ResponseTemplate(
                Arrays.asList("hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"),
                "Hello! 👋 I'm **PetGuardian Assistant**, your AI companion for pet health and care.\n\n" +
                        "I can help you with:\n" +
                        "✅ Skin condition concerns (try our AI Scanner!)\n" +
                        "✅ Vaccination schedules\n" +
                        "✅ Nutrition and diet advice\n" +
                        "✅ Finding nearby vets\n" +
                        "✅ Emergency guidance\n" +
                        "✅ Training tips\n\n" +
                        "How can I assist your pet today? 🐾"
        ));

        KNOWLEDGE_BASE.put("skin", new ResponseTemplate(
                Arrays.asList("skin", "rash", "itch", "scratch", "red", "spot", "lesion", "bump", "scab", "wound"),
                "🔍 **Common Skin Conditions in Pets:**\n\n" +
                        "• **Allergies** - Environmental or food-related\n" +
                        "• **Hot Spots** - Moist, inflamed skin areas\n" +
                        "• **Fungal Infections** - Ringworm, yeast\n" +
                        "• **Parasites** - Fleas, mites, ticks\n" +
                        "• **Bacterial Infections** - Often secondary to other issues\n\n" +
                        "⚠️ **Warning Signs:**\n" +
                        "• Persistent itching or licking\n" +
                        "• Hair loss or bald patches\n" +
                        "• Redness, swelling, or discharge\n" +
                        "• Foul odor from skin\n\n" +
                        "💡 **Recommended Actions:**\n" +
                        "1. Use our **AI Skin Scanner** for preliminary assessment\n" +
                        "2. Take clear photos of affected areas\n" +
                        "3. Consult a veterinarian for diagnosis\n" +
                        "4. Avoid home remedies without vet approval\n\n" +
                        "Would you like to scan your pet's skin condition now?"
        ));

        KNOWLEDGE_BASE.put("vaccination", new ResponseTemplate(
                Arrays.asList("vaccine", "vaccination", "shot", "immunization", "booster", "vaccinate"),
                "💉 **Pet Vaccination Guide:**\n\n" +
                        "**Dogs Need:**\n" +
                        "• DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)\n" +
                        "• Rabies (legally required)\n" +
                        "• Bordetella (Kennel Cough)\n" +
                        "• Leptospirosis\n" +
                        "• Lyme disease (in endemic areas)\n\n" +
                        "**Cats Need:**\n" +
                        "• FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)\n" +
                        "��� Rabies\n" +
                        "• FeLV (Feline Leukemia - for outdoor cats)\n\n" +
                        "**Puppy/Kitten Schedule:**\n" +
                        "• 6-8 weeks: First round\n" +
                        "• 10-12 weeks: Second round\n" +
                        "• 14-16 weeks: Final puppy/kitten shots\n" +
                        "• 1 year: First annual booster\n" +
                        "• Annual or every 3 years thereafter\n\n" +
                        "📅 Check your pet's **Health Passport** for their specific schedule!\n" +
                        "🏥 Need a vet? Use **Vet Connect** to find nearby clinics."
        ));

        KNOWLEDGE_BASE.put("allergy", new ResponseTemplate(
                Arrays.asList("allergy", "allergies", "allergic", "reaction"),
                "🤧 **Pet Allergy Guide:**\n\n" +
                        "**Common Symptoms:**\n" +
                        "• Excessive scratching or licking\n" +
                        "• Red, inflamed skin\n" +
                        "• Ear infections (recurring)\n" +
                        "• Watery eyes or sneezing\n" +
                        "• Digestive issues (vomiting, diarrhea)\n" +
                        "• Hair loss or hot spots\n\n" +
                        "**Common Allergens:**\n" +
                        "• **Food:** Beef, chicken, dairy, wheat, soy\n" +
                        "• **Environmental:** Pollen, dust mites, mold\n" +
                        "• **Fleas:** Flea bite hypersensitivity\n" +
                        "• **Contact:** Cleaning products, fabrics\n\n" +
                        "**What You Can Do:**\n" +
                        "1. Identify triggers through elimination\n" +
                        "2. Keep environment clean (vacuum, air filters)\n" +
                        "3. Use hypoallergenic products\n" +
                        "4. Consider limited-ingredient diets\n" +
                        "5. Consult vet for allergy testing\n\n" +
                        "⚠️ Severe reactions (facial swelling, difficulty breathing) require **immediate veterinary care**!"
        ));

        KNOWLEDGE_BASE.put("emergency", new ResponseTemplate(
                Arrays.asList("emergency", "urgent", "serious", "critical", "dying", "help"),
                "🚨 **PET EMERGENCY PROTOCOL:**\n\n" +
                        "**IMMEDIATE VET ATTENTION NEEDED IF:**\n" +
                        "🔴 Difficulty breathing or choking\n" +
                        "🔴 Severe bleeding or trauma\n" +
                        "🔴 Inability to stand or walk\n" +
                        "🔴 Seizures or convulsions\n" +
                        "🔴 Suspected poisoning\n" +
                        "🔴 Bloated, hard abdomen (especially large dogs)\n" +
                        "🔴 Extreme lethargy or unresponsiveness\n" +
                        "🔴 Straining to urinate (especially male cats)\n\n" +
                        "**EMERGENCY STEPS:**\n" +
                        "1️⃣ **Stay Calm** - Your pet senses your stress\n" +
                        "2️⃣ **Assess Safety** - Ensure you and pet are safe\n" +
                        "3️⃣ **Call Vet/ER** - Describe symptoms clearly\n" +
                        "4️⃣ **Follow Instructions** - Do not give meds without approval\n" +
                        "5️⃣ **Transport Safely** - Use carrier or blanket\n\n" +
                        "🏥 **FIND EMERGENCY VET NOW:**\n" +
                        "Use our **Vet Connect** feature to locate 24/7 emergency clinics near you!\n\n" +
                        "⚠️ If this is a TRUE EMERGENCY, call your vet or emergency clinic IMMEDIATELY!"
        ));

        KNOWLEDGE_BASE.put("food", new ResponseTemplate(
                Arrays.asList("food", "diet", "eat", "feed", "nutrition", "meal", "feeding"),
                "🍖 **Pet Nutrition Guide:**\n\n" +
                        "**Balanced Diet Essentials:**\n" +
                        "• High-quality protein (meat, fish)\n" +
                        "• Healthy fats (omega-3, omega-6)\n" +
                        "• Complex carbohydrates\n" +
                        "• Vitamins and minerals\n" +
                        "• Fresh water (always available)\n\n" +
                        "**Age-Appropriate Feeding:**\n" +
                        "• **Puppies/Kittens:** 3-4 meals/day, high-calorie\n" +
                        "• **Adults:** 1-2 meals/day, maintain weight\n" +
                        "• **Seniors:** Specialized formulas, joint support\n\n" +
                        "**TOXIC FOODS (NEVER GIVE):**\n" +
                        "❌ Chocolate, coffee, caffeine\n" +
                        "❌ Grapes and raisins\n" +
                        "❌ Onions, garlic, chives\n" +
                        "❌ Xylitol (artificial sweetener)\n" +
                        "❌ Alcohol\n" +
                        "❌ Macadamia nuts\n" +
                        "❌ Raw dough, avocado\n\n" +
                        "**Portion Control:**\n" +
                        "• Follow package guidelines\n" +
                        "• Adjust for activity level\n" +
                        "• Monitor weight monthly\n" +
                        "• Treats should be <10% of daily calories\n\n" +
                        "🩺 For personalized diet plans, consult your veterinarian!"
        ));

        KNOWLEDGE_BASE.put("training", new ResponseTemplate(
                Arrays.asList("train", "training", "behavior", "obedience", "teach", "discipline"),
                "🎓 **Effective Pet Training Tips:**\n\n" +
                        "**Core Principles:**\n" +
                        "✅ **Positive Reinforcement** - Reward good behavior\n" +
                        "✅ **Consistency** - Same commands, same rules\n" +
                        "✅ **Patience** - Every pet learns at their own pace\n" +
                        "✅ **Timing** - Reward within 2 seconds of action\n\n" +
                        "**Basic Commands (Start Here):**\n" +
                        "1. **Sit** - Foundation command\n" +
                        "2. **Stay** - Builds impulse control\n" +
                        "3. **Come** - Safety essential\n" +
                        "4. **Down** - Calmness training\n" +
                        "5. **Leave It** - Prevents dangerous situations\n\n" +
                        "**Training Sessions:**\n" +
                        "• Keep sessions 5-10 minutes\n" +
                        "• Train before meals (motivation)\n" +
                        "• End on a positive note\n" +
                        "• Practice in different environments\n\n" +
                        "**Common Mistakes to Avoid:**\n" +
                        "❌ Punishment-based training\n" +
                        "❌ Inconsistent rules\n" +
                        "❌ Sessions too long\n" +
                        "❌ Not enough patience\n\n" +
                        "💡 Consider professional training classes for best results!"
        ));

        KNOWLEDGE_BASE.put("grooming", new ResponseTemplate(
                Arrays.asList("groom", "grooming", "brush", "bath", "nail", "trim", "clean"),
                "✂️ **Pet Grooming Essentials:**\n\n" +
                        "**Dogs:**\n" +
                        "• **Brushing:** 1-3x/week (daily for long coats)\n" +
                        "• **Bathing:** Every 4-6 weeks\n" +
                        "• **Nail Trimming:** Monthly\n" +
                        "• **Ear Cleaning:** Weekly check, clean as needed\n" +
                        "• **Teeth Brushing:** Daily (minimum 3x/week)\n\n" +
                        "**Cats:**\n" +
                        "• **Brushing:** 2-3x/week (daily for long hair)\n" +
                        "• **Bathing:** Rarely needed (self-groomers)\n" +
                        "• **Nail Trimming:** Every 2-3 weeks\n" +
                        "• **Ear Cleaning:** Monthly check\n" +
                        "• **Teeth Brushing:** Daily (use cat-specific paste)\n\n" +
                        "**Grooming Tools:**\n" +
                        "🔹 Slicker brush or comb\n" +
                        "🔹 Pet-safe shampoo\n" +
                        "🔹 Nail clippers (guillotine or scissor type)\n" +
                        "🔹 Ear cleaning solution\n" +
                        "🔹 Pet toothbrush and paste\n\n" +
                        "**When to See a Professional:**\n" +
                        "• Severe matting or tangles\n" +
                        "• Breed-specific cuts\n" +
                        "• Fear or aggression during grooming\n" +
                        "• Nail quick bleeding\n\n" +
                        "Regular grooming helps detect health issues early! 🔍"
        ));

        KNOWLEDGE_BASE.put("vet", new ResponseTemplate(
                Arrays.asList("vet", "veterinarian", "doctor", "clinic", "hospital"),
                "🏥 **When to Visit a Veterinarian:**\n\n" +
                        "**IMMEDIATE (24-48 hours):**\n" +
                        "• Loss of appetite (>24 hours)\n" +
                        "• Vomiting or diarrhea (multiple times)\n" +
                        "• Lethargy or behavior changes\n" +
                        "• Coughing or sneezing\n" +
                        "• Limping or difficulty moving\n\n" +
                        "**ROUTINE CARE:**\n" +
                        "• Annual wellness exams\n" +
                        "• Vaccination boosters\n" +
                        "• Dental cleanings\n" +
                        "• Weight management\n" +
                        "• Senior pet screenings (7+ years)\n\n" +
                        "**PREVENTIVE CARE:**\n" +
                        "• Flea/tick prevention (monthly)\n" +
                        "• Heartworm prevention (monthly)\n" +
                        "• Deworming (as recommended)\n" +
                        "• Spay/neuter (6-12 months)\n\n" +
                        "**Finding a Vet:**\n" +
                        "🔍 Use our **Vet Connect** feature to:\n" +
                        "• Find nearby clinics\n" +
                        "• Check specializations\n" +
                        "• Read reviews\n" +
                        "• Get directions\n" +
                        "• Book appointments\n\n" +
                        "💡 Establish a relationship with a vet BEFORE emergencies!"
        ));

        KNOWLEDGE_BASE.put("help", new ResponseTemplate(
                Arrays.asList("help", "what can you do", "commands", "features", "assist"),
                "🤖 **PetGuardian Assistant - Help Center**\n\n" +
                        "**I Can Help With:**\n\n" +
                        "🔹 **Health Concerns**\n" +
                        "   → Skin conditions, allergies, symptoms\n" +
                        "   → Emergency guidance\n" +
                        "   → When to see a vet\n\n" +
                        "🔹 **Preventive Care**\n" +
                        "   → Vaccination schedules\n" +
                        "   → Nutrition and diet\n" +
                        "   → Grooming tips\n\n" +
                        "🔹 **Training & Behavior**\n" +
                        "   → Basic commands\n" +
                        "   → Positive reinforcement techniques\n\n" +
                        "🔹 **Platform Features**\n" +
                        "   → AI Skin Scanner usage\n" +
                        "   → Vet Connect system\n" +
                        "   → Health Passport management\n\n" +
                        "**Quick Tips:**\n" +
                        "• Ask specific questions (e.g., \"My dog has a rash\")\n" +
                        "• Include symptoms for better guidance\n" +
                        "• Use our AI Scanner for skin conditions\n" +
                        "• Always consult a vet for medical decisions\n\n" +
                        "**Disclaimer:** 🩺\n" +
                        "I provide general information only. I am NOT a replacement for professional veterinary care.\n\n" +
                        "What would you like to know about your pet? 🐾"
        ));

        KNOWLEDGE_BASE.put("scanner", new ResponseTemplate(
                Arrays.asList("scanner", "scan", "ai", "upload", "image", "photo", "picture"),
                "📸 **AI Skin Scanner Guide:**\n\n" +
                        "**How to Use:**\n" +
                        "1. Go to **AI Scan** section\n" +
                        "2. Select your pet\n" +
                        "3. Upload a clear photo of the skin condition\n" +
                        "4. Wait for AI analysis\n" +
                        "5. Review severity and recommendations\n\n" +
                        "**Photo Tips for Best Results:**\n" +
                        "✅ Good lighting (natural light preferred)\n" +
                        "✅ Clear focus on affected area\n" +
                        "✅ Close-up view\n" +
                        "✅ Multiple angles if possible\n" +
                        "❌ Avoid blurry images\n" +
                        "❌ Avoid low light\n\n" +
                        "**What Happens After:**\n" +
                        "• **Mild:** Home care guidance\n" +
                        "• **Moderate:** Vet recommended\n" +
                        "• **Severe:** Auto-triggers **Vet Connect**\n\n" +
                        "**Important:**\n" +
                        "⚠️ AI provides PRELIMINARY assessment only\n" +
                        "⚠️ Always confirm with a licensed veterinarian\n" +
                        "⚠️ Results saved to your pet's medical history\n\n" +
                        "Ready to scan? Head to the AI Scanner! 🔍"
        ));

        KNOWLEDGE_BASE.put("thank", new ResponseTemplate(
                Arrays.asList("thank", "thanks", "thank you", "appreciate"),
                "You're very welcome! 🐾\n\n" +
                        "I'm always here to help with your pet care questions.\n\n" +
                        "Remember:\n" +
                        "• Use our **AI Skin Scanner** for skin concerns\n" +
                        "• Check **Vet Connect** to find nearby clinics\n" +
                        "• Keep your pet's **Health Passport** updated\n\n" +
                        "Is there anything else you'd like to know? 😊"
        ));

        KNOWLEDGE_BASE.put("default", new ResponseTemplate(
                Collections.emptyList(),
                "I'm here to help with pet health and care! 🐾\n\n" +
                        "I can provide information about:\n" +
                        "• Common health concerns\n" +
                        "• Nutrition and diet\n" +
                        "• Vaccinations\n" +
                        "• Training tips\n" +
                        "• Grooming\n" +
                        "• When to seek veterinary care\n\n" +
                        "For specific medical advice, please consult a licensed veterinarian.\n\n" +
                        "Is there something specific about your pet you'd like to know?"
        ));
    }

    @Transactional
    public ChatResponse sendMessage(ChatRequest request, User user) {
        log.info("Processing message from user {}: {}", user.getId(), request.getMessage());

        // Save user message
        ChatMessage userMessage = ChatMessage.builder()
                .content(request.getMessage())
                .isBot(false)
                .user(user)
                .build();
        chatHistoryRepository.save(userMessage);

        // Generate bot response
        String botResponseContent = generateResponse(request.getMessage(), user);

        // Save bot message
        ChatMessage botMessage = ChatMessage.builder()
                .content(botResponseContent)
                .isBot(true)
                .user(user)
                .build();
        ChatMessage savedBotMessage = chatHistoryRepository.save(botMessage);

        log.info("Bot response generated for user {}", user.getId());

        return ChatResponse.builder()
                .id(savedBotMessage.getId())
                .message(savedBotMessage.getContent())
                .isBot(true)
                .timestamp(savedBotMessage.getCreatedAt())
                .build();
    }

    public List<ChatResponse> getChatHistory(User user) {
        List<ChatMessage> messages = chatHistoryRepository.findTop50ByUserIdOrderByCreatedAtDesc(user.getId());
        Collections.reverse(messages); // Show oldest first

        return messages.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void clearHistory(User user) {
        log.info("Clearing chat history for user {}", user.getId());
        chatHistoryRepository.deleteByUserId(user.getId());
    }

    private String generateResponse(String message, User user) {
        String lowerMessage = message.toLowerCase().trim();

        // Check each knowledge base entry
        for (Map.Entry<String, ResponseTemplate> entry : KNOWLEDGE_BASE.entrySet()) {
            ResponseTemplate template = entry.getValue();
            if (template.matches(lowerMessage)) {
                return personalizeResponse(template.getResponse(), user);
            }
        }

        // Default response
        return personalizeResponse(KNOWLEDGE_BASE.get("default").getResponse(), user);
    }

    private String personalizeResponse(String response, User user) {
        // You can add personalization here if needed
        return response;
    }

    private ChatResponse mapToResponse(ChatMessage message) {
        return ChatResponse.builder()
                .id(message.getId())
                .message(message.getContent())
                .isBot(message.isBot())
                .timestamp(message.getCreatedAt())
                .build();
    }

    // Helper class for response templates
    private static class ResponseTemplate {
        private final List<String> keywords;
        private final String response;

        public ResponseTemplate(List<String> keywords, String response) {
            this.keywords = keywords;
            this.response = response;
        }

        public boolean matches(String message) {
            return keywords.stream().anyMatch(message::contains);
        }

        public String getResponse() {
            return response;
        }
    }
}