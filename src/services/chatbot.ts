import { api } from "./api";

/**
 * Chatbot Service
 * Handles communication with AI chatbot API
 * Supports context-aware responses for farmers and buyers
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  context?: ChatContext;
}

export interface ChatContext {
  userType: "farmer" | "buyer" | "guest";
  location?: string;
  weather?: any;
  recentActivity?: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  actions?: ChatAction[];
}

export interface ChatAction {
  label: string;
  type: "navigate" | "action" | "info";
  payload?: any;
}

class ChatbotService {
  private conversationHistory: ChatMessage[] = [];
  private apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  /**
   * Send message to chatbot and get response
   */
  async sendMessage(
    message: string,
    context: ChatContext
  ): Promise<ChatResponse> {
    try {
      const response = await api.post("/chat", {
        message,
        context,
        history: this.conversationHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      // Store in history
      this.conversationHistory.push({
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date(),
        context,
      });

      this.conversationHistory.push({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.data.message,
        timestamp: new Date(),
      });

      return response.data;
    } catch (error) {
      console.error("Chat error:", error);
      throw error;
    }
  }

  /**
   * Get quick suggestions based on context
   */
  getContextualSuggestions(context: ChatContext): string[] {
    const suggestions: string[] = [];

    if (context.userType === "farmer") {
      suggestions.push(
        "How do I optimize crop yield?",
        "What products are trending?",
        "Tell me about soil preparation",
        "Best time to plant tomatoes?",
        "How to prevent crop diseases?"
      );
    } else if (context.userType === "buyer") {
      suggestions.push(
        "Where can I find fresh produce?",
        "How to spot quality vegetables?",
        "What's in season now?",
        "Fair pricing guidelines",
        "How to connect with farmers?"
      );
    } else {
      suggestions.push(
        "Welcome! Are you a farmer or buyer?",
        "Tell me about your location",
        "What would you like to know?"
      );
    }

    return suggestions;
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  /**
   * Generate farmer-specific prompt
   */
  generateFarmerPrompt(baseMessage: string, context: ChatContext): string {
    let prompt = baseMessage;

    if (context.location) {
      prompt += `\n[Farmer Location: ${context.location}]`;
    }

    if (context.weather) {
      prompt += `\n[Current Weather: ${context.weather.condition}, ${context.weather.temperature}°C]`;
    }

    prompt +=
      `\n[Provide practical agricultural advice considering the farmer's location and current conditions]` +
      `\n[Include recommendations for crops suitable for this region]` +
      `\n[Consider seasonal farming practices]`;

    return prompt;
  }

  /**
   * Generate buyer-specific prompt
   */
  generateBuyerPrompt(baseMessage: string, context: ChatContext): string {
    let prompt = baseMessage;

    if (context.location) {
      prompt += `\n[Buyer Location: ${context.location}]`;
    }

    prompt +=
      `\n[Provide helpful guidance for purchasing quality agricultural produce]` +
      `\n[Consider seasonal availability of crops]` +
      `\n[Include tips on quality assessment and fair pricing]`;

    return prompt;
  }

  /**
   * Get quick farming tips
   */
  getFarmingTips(): string[] {
    return [
      "🌱 Crop Rotation: Alternate crops to maintain soil health",
      "💧 Irrigation: Water early morning or evening to reduce evaporation",
      "🍃 Pest Control: Use natural methods first (neem, companion planting)",
      "🌿 Soil Testing: Test soil annually to monitor nutrients",
      "🌾 Composting: Make compost for sustainable soil enrichment",
      "📅 Seasonal Planting: Follow crop calendar for your region",
      "🛡️ Disease Prevention: Ensure proper spacing and ventilation",
      "📊 Record Keeping: Track planting, harvesting, and yields",
    ];
  }

  /**
   * Get buying tips
   */
  getBuyingTips(): string[] {
    return [
      "👃 Smell Test: Fresh produce has a strong, natural aroma",
      "🔍 Visual Inspection: Look for vibrant colors and no blemishes",
      "✋ Feel Test: Produce should be firm, not soft or mushy",
      "📅 Seasonal Shopping: In-season produce is fresher and cheaper",
      "🤝 Direct from Farmers: Better quality and price than middlemen",
      "💬 Ask Questions: Find out when it was harvested",
      "📦 Storage Tips: Store properly to extend freshness",
      "💰 Fair Pricing: Know market rates to avoid overpaying",
    ];
  }
}

export default new ChatbotService();
