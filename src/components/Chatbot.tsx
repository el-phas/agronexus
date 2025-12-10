import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  X,
  Loader,
  Cloud,
  Lightbulb,
  ChevronDown,
} from "lucide-react";
import chatbotService from "@/services/chatbot";
import weatherService from "@/services/weather";
import type { ChatContext, ChatMessage } from "@/services/chatbot";

interface ChatbotProps {
  userType?: "farmer" | "buyer" | "guest";
  location?: string;
  onClose?: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  userType = "guest",
  location = "",
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        userType === "farmer"
          ? "👋 Hello Farmer! I'm here to help you with crop advice, market insights, and farming best practices. How can I assist you today?"
          : userType === "buyer"
            ? "👋 Hello Buyer! I'm here to help you find quality produce and connect with farmers. What are you looking for?"
            : "👋 Hello! I'm your agricultural assistant. Are you a farmer or buyer?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const context: ChatContext = {
    userType: userType as "farmer" | "buyer" | "guest",
    location,
    weather,
  };

  // Fetch weather on mount
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (location) {
          const weatherData = await weatherService.getWeatherByCity(location);
          setWeather(weatherData);
        } else if (navigator.geolocation) {
          const coords = await weatherService.getCurrentLocation();
          const weatherData = await weatherService.getWeatherByCoords(
            coords.latitude,
            coords.longitude
          );
          setWeather(weatherData);
        }
      } catch (error) {
        console.error("Failed to fetch weather:", error);
      }
    };

    if (isOpen) {
      fetchWeather();
    }
  }, [isOpen, location]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
      context,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await chatbotService.sendMessage(input, context);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Sorry, I encountered an error. Please try again or contact support.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = chatbotService.getContextualSuggestions(context);

  const tips =
    userType === "farmer"
      ? chatbotService.getFarmingTips()
      : chatbotService.getBuyingTips();

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-hero text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          aria-label="Open chatbot"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-96 h-[600px] shadow-2xl flex flex-col">
          {/* Header */}
          <CardHeader className="bg-gradient-hero text-white rounded-t-lg p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <div>
                  <CardTitle className="text-base">Farm Assistant</CardTitle>
                  <p className="text-xs text-primary-foreground/70">
                    {userType === "farmer"
                      ? "Crop & Market Guidance"
                      : userType === "buyer"
                        ? "Produce & Trading Help"
                        : "Agricultural Support"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 overflow-hidden">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.role === "user"
                        ? "bg-leaf text-white rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground px-4 py-2 rounded-lg rounded-bl-none">
                    <Loader className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    💡 Quick suggestions:
                  </p>
                  <div className="space-y-2">
                    {suggestions.slice(0, 3).map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInput(suggestion);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left text-sm p-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Weather Widget */}
              {weather && (
                <div className="mt-4 p-3 bg-gradient-to-br from-sky/10 to-leaf/10 rounded-lg">
                  <div className="flex items-start gap-2 text-sm">
                    <Cloud className="w-5 h-5 text-sky flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{weather.location}</p>
                      <p className="text-xs text-muted-foreground">
                        {weather.temperature}°C • {weather.condition}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Humidity: {weather.humidity}% | Wind: {weather.windSpeed}{" "}
                        m/s
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tips */}
              {showSuggestions && tips.length > 0 && (
                <div className="mt-4 p-3 bg-accent/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-harvest" />
                    <p className="text-xs font-semibold">
                      {userType === "farmer" ? "Farming" : "Buying"} Tip:
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tips[Math.floor(Math.random() * tips.length)]}
                  </p>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <CardContent className="p-4 border-t border-border flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="bg-leaf hover:bg-leaf/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💬 Powered by AI • Real-time weather data
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Chatbot;
