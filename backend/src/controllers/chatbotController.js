/**
 * Chatbot Controller
 * Handles AI chat requests with context awareness
 * Integrates with AI API (Groq, OpenAI, or local Ollama)
 */

import axios from 'axios';

// Using Groq API (free tier available) - https://console.groq.com
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Fallback system prompts for different user types
const SYSTEM_PROMPTS = {
  farmer: `You are an agricultural expert assistant helping farmers with crop production, soil management, pest control, and market insights. 
  Provide practical, actionable advice based on the user's location and weather conditions.
  Focus on sustainable farming practices and maximizing crop yield.
  Be encouraging and supportive. If you don't know something, admit it and suggest they consult a specialist.`,

  buyer: `You are a produce quality and trading expert helping buyers find the best quality agricultural products.
  Provide guidance on how to identify fresh produce, understand fair pricing, and connect with farmers.
  Be helpful and honest about quality standards.
  Include tips on storage and preparation when relevant.`,

  guest: `You are a friendly agricultural information assistant.
  Help users understand farming, agriculture, and food production.
  Determine if they're a farmer or buyer and adjust your responses accordingly.
  Suggest they log in for more personalized assistance.`,
};

// System message with context
const buildSystemMessage = (context) => {
  const basePrompt = SYSTEM_PROMPTS[context.userType] || SYSTEM_PROMPTS.guest;

  let contextInfo = "";
  if (context.location) {
    contextInfo += `\nUser location: ${context.location}`;
  }
  if (context.weather) {
    contextInfo += `\nCurrent weather: ${context.weather.condition}, ${context.weather.temperature}°C, Humidity: ${context.weather.humidity}%`;
  }
  if (context.recentActivity) {
    contextInfo += `\nRecent context: ${context.recentActivity}`;
  }

  return basePrompt + contextInfo;
};

/**
 * Send message to chatbot
 * POST /api/chat
 */
export const sendMessage = async (req, res) => {
  try {
    const { message, context = {}, history = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Validate API key
    if (!GROQ_API_KEY) {
      console.warn("GROQ_API_KEY not configured, using mock response");
      return handleMockResponse(message, context, res);
    }

    // Build conversation messages
    const systemMessage = buildSystemMessage(context);

    const messages = [
      { role: "system", content: systemMessage },
      ...history.slice(-10), // Keep last 10 messages for context
      { role: "user", content: message },
    ];

    // Call Groq API
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "mixtral-8x7b-32768",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const botMessage = response.data.choices[0].message.content;

    // Generate suggestions based on response
    const suggestions = generateSuggestions(message, context);

    res.json({
      message: botMessage,
      suggestions,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Chatbot error:", error.message);

    // Fallback to mock response on error
    return handleMockResponse(req.body.message, req.body.context || {}, res);
  }
};

/**
 * Handle mock response (fallback when API unavailable)
 */
function handleMockResponse(message, context, res) {
  const responses = getMockResponses(message, context);
  const randomResponse =
    responses[Math.floor(Math.random() * responses.length)];

  res.json({
    message: randomResponse,
    suggestions: generateSuggestions(message, context),
    timestamp: new Date(),
  });
}

/**
 * Get mock responses based on user type
 */
function getMockResponses(message, context) {
  const userType = context.userType || "guest";
  const lowerMessage = message.toLowerCase();

  // General responses
  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("hey")
  ) {
    const responses = {
      farmer: [
        "👋 Hello! I'm here to help with your farming needs. What crops are you growing?",
        "Welcome! How can I assist with your farm today?",
      ],
      buyer: [
        "👋 Hello! Looking for fresh produce? I can help you find the best quality!",
        "Hi there! What are you interested in purchasing today?",
      ],
      guest: [
        "👋 Hello! Are you a farmer or buyer? I can provide better assistance once I know!",
      ],
    };
    return responses[userType] || responses.guest;
  }

  // Weather-related
  if (lowerMessage.includes("weather") || lowerMessage.includes("rain")) {
    const weatherTips = {
      farmer: [
        "🌤️ For farming, it's important to monitor weather closely. Rain is great for crops, but watch for waterlogging. Strong winds can damage tall crops.",
        "☀️ Hot and dry weather means more irrigation needed. Check soil moisture regularly to prevent drought stress.",
      ],
      buyer: [
        "🌤️ Weather affects crop availability. During rainy season, leafy greens are abundant but root crops may be scarce.",
        "☀️ Hot weather brings more fresh fruits to market. Stock up when availability is high!",
      ],
    };
    return weatherTips[userType] || weatherTips.guest;
  }

  // Crop-related (for farmers)
  if (
    userType === "farmer" &&
    (lowerMessage.includes("crop") ||
      lowerMessage.includes("plant") ||
      lowerMessage.includes("yield"))
  ) {
    return [
      "🌱 To maximize yields, ensure proper spacing between plants for airflow and light penetration.",
      "💧 Irrigation timing is crucial - water early morning or late evening to reduce evaporation.",
      "🍃 Rotate crops annually to maintain soil health and reduce pest buildup.",
      "🐛 Use integrated pest management - combine cultural, biological, and chemical methods.",
    ];
  }

  // Buying/pricing (for buyers)
  if (
    userType === "buyer" &&
    (lowerMessage.includes("price") ||
      lowerMessage.includes("quality") ||
      lowerMessage.includes("fresh") ||
      lowerMessage.includes("farmer"))
  ) {
    return [
      "💰 Direct from farmers usually offers better prices and fresher produce than middlemen.",
      "👃 Fresh produce has a strong natural aroma and vibrant colors - use your senses!",
      "📅 Seasonal produce is cheaper and fresher - ask what's currently in season.",
      "🤝 Building relationships with farmers can get you better prices and first pick of quality items.",
    ];
  }

  // Default helpful responses
  const defaultResponses = [
    "That's a great question! Could you provide more details so I can give you better advice?",
    "I'm here to help! Based on what you've said, here's what I recommend: [Specific advice based on context]",
    "Interesting! Let me provide you with some practical guidance on that.",
    "I can definitely help with that. In your region, here are the best practices:",
  ];

  return defaultResponses;
}

/**
 * Generate contextual suggestions
 */
function generateSuggestions(message, context) {
  const suggestions = [];
  const lowerMessage = message.toLowerCase();

  if (context.userType === "farmer") {
    if (lowerMessage.includes("pest") || lowerMessage.includes("disease")) {
      suggestions.push(
        "Show me organic pest control methods",
        "How to identify crop diseases",
        "Best fungicides to use"
      );
    } else if (lowerMessage.includes("soil")) {
      suggestions.push(
        "Soil pH testing procedure",
        "Composting for soil improvement",
        "Nutrient deficiency signs"
      );
    } else {
      suggestions.push(
        "Best crops for this season",
        "Irrigation schedule tips",
        "Market prices for my crops"
      );
    }
  } else if (context.userType === "buyer") {
    if (lowerMessage.includes("quality")) {
      suggestions.push(
        "How to test for freshness",
        "Storage tips",
        "Best harvesting time"
      );
    } else {
      suggestions.push(
        "Connect me with farmers",
        "What's in season now?",
        "Fair pricing guide"
      );
    }
  }

  return suggestions.slice(0, 3);
}

/**
 * Get chat history for a user (if integrated with auth)
 * GET /api/chat/history
 */
export const getChatHistory = async (req, res) => {
  try {
    // This would require storing chat history in database
    // For now, we'll return a success message
    res.json({
      message: "Chat history feature coming soon",
      history: [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Clear chat history for a user
 * DELETE /api/chat/history
 */
export const clearChatHistory = async (req, res) => {
  try {
    // This would require clearing from database
    res.json({ message: "Chat history cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get farming tips
 * GET /api/chat/tips/farming
 */
export const getFarmingTips = async (req, res) => {
  const tips = [
    "🌱 Crop Rotation: Alternate crops to maintain soil health",
    "💧 Irrigation: Water early morning or evening to reduce evaporation",
    "🍃 Pest Control: Use natural methods first (neem, companion planting)",
    "🌿 Soil Testing: Test soil annually to monitor nutrients",
    "🍎 Composting: Make compost for sustainable soil enrichment",
    "📅 Seasonal Planting: Follow crop calendar for your region",
    "🛡️ Disease Prevention: Ensure proper spacing and ventilation",
    "📊 Record Keeping: Track planting, harvesting, and yields",
    "💰 Cost Management: Calculate input costs vs expected returns",
    "🤝 Network: Join farmer groups for shared knowledge",
  ];

  res.json({ tips });
};

/**
 * Get buying tips
 * GET /api/chat/tips/buying
 */
export const getBuyingTips = async (req, res) => {
  const tips = [
    "👃 Smell Test: Fresh produce has a strong, natural aroma",
    "🔍 Visual Inspection: Look for vibrant colors and no blemishes",
    "✋ Feel Test: Produce should be firm, not soft or mushy",
    "📅 Seasonal Shopping: In-season produce is fresher and cheaper",
    "🤝 Direct from Farmers: Better quality and price than middlemen",
    "💬 Ask Questions: Find out when it was harvested",
    "📦 Storage Tips: Store properly to extend freshness",
    "💰 Fair Pricing: Know market rates to avoid overpaying",
    "🌍 Know Your Farmer: Understanding their practices builds trust",
    "📸 Photo Documentation: Track quality of previous purchases",
  ];

  res.json({ tips });
};
