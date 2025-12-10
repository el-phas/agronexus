#!/bin/bash

# AI Chatbot & Weather Integration Setup Script
# Quick reference for configuring the chatbot and weather features

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║     AI Chatbot & Weather Integration Setup                   ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

echo ""
echo "📋 SETUP CHECKLIST"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 1. Weather API
echo "1️⃣  OpenWeatherMap API Key (Required for Weather)"
echo "   ─────────────────────────────────────────────────"
echo "   • Visit: https://openweathermap.org/api"
echo "   • Sign up for FREE account"
echo "   • Go to 'API Keys' section"
echo "   • Copy your API key"
echo ""
echo "   Add to .env (frontend):"
echo "   VITE_WEATHER_API_KEY=your_api_key_here"
echo ""

# 2. AI API
echo "2️⃣  AI API Key (Choose ONE - Recommended: Groq)"
echo "   ─────────────────────────────────────────────────"
echo ""
echo "   🎯 OPTION A: Groq API (RECOMMENDED - Free)"
echo "      ✓ 30 requests/minute free tier"
echo "      ✓ Faster responses"
echo "      ✓ Most affordable"
echo "      • Visit: https://console.groq.com"
echo "      • Sign up for FREE account"
echo "      • Generate API key"
echo "      • Add to backend/.env:"
echo "      GROQ_API_KEY=your_api_key_here"
echo ""
echo "   💳 OPTION B: OpenAI API (Requires Payment)"
echo "      ✓ More powerful models"
echo "      ✓ Better quality responses"
echo "      ✗ Requires payment (~$5 minimum)"
echo "      • Visit: https://platform.openai.com"
echo "      • Sign up and add payment method"
echo "      • Generate API key"
echo "      • Add to backend/.env:"
echo "      OPENAI_API_KEY=your_api_key_here"
echo ""
echo "   🖥️  OPTION C: Ollama (Self-Hosted - Free)"
echo "      ✓ Completely free"
echo "      ✓ Runs locally"
echo "      ✓ No internet required"
echo "      ✗ Requires 8GB+ RAM"
echo "      • Download: https://ollama.ai"
echo "      • Run: ollama run mistral"
echo "      • Add to backend/.env:"
echo "      OLLAMA_BASE_URL=http://localhost:11434"
echo ""

# 3. File locations
echo "3️⃣  Configuration Files"
echo "   ─────────────────────────────────────────────────"
echo "   Frontend config:  .env"
echo "   Backend config:   backend/.env"
echo ""
echo "   Example .env (Frontend):"
echo "   ─────────────────────────"
cat << 'EOF'
   VITE_API_BASE_URL=http://localhost:4000
   VITE_WEATHER_API_KEY=your_openweathermap_key_here
EOF
echo ""
echo "   Example backend/.env:"
echo "   ────────────────────────"
cat << 'EOF'
   DATABASE_URL=postgres://agronexus:password@localhost:5432/agronexus_db
   NODE_ENV=development
   PORT=4000
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   GROQ_API_KEY=your_groq_api_key_here
EOF
echo ""

# 4. Start application
echo "4️⃣  Start Application"
echo "   ─────────────────────────────────────────────────"
echo ""
echo "   Terminal 1 - Backend:"
echo "   ──────────────────────"
cat << 'EOF'
   cd /workspaces/agro-nexus-connect/backend
   docker-compose up -d
   npm install
   npm run db:sync && npm run db:seed
   npm run dev
EOF
echo ""
echo "   Terminal 2 - Frontend:"
echo "   ──────────────────────"
cat << 'EOF'
   cd /workspaces/agro-nexus-connect
   npm install
   npm run dev
EOF
echo ""
echo "   Then open: http://localhost:8080"
echo ""

# 5. Testing
echo "5️⃣  Testing"
echo "   ─────────────────────────────────────────────────"
echo ""
echo "   Test Chatbot Endpoint:"
echo "   ───────────────────────"
cat << 'EOF'
   curl -X POST http://localhost:4000/api/chat \
     -H "Content-Type: application/json" \
     -d '{
       "message": "Hello",
       "context": {
         "userType": "farmer",
         "location": "Nairobi"
       }
     }'
EOF
echo ""
echo "   Test Farming Tips:"
echo "   ─────────────────"
echo "   curl http://localhost:4000/api/chat/tips/farming"
echo ""
echo "   Test Buying Tips:"
echo "   ────────────────"
echo "   curl http://localhost:4000/api/chat/tips/buying"
echo ""

# 6. Features
echo "6️⃣  Features Included"
echo "   ─────────────────────────────────────────────────"
echo ""
echo "   🤖 Chatbot Features:"
echo "      ✓ Context-aware responses for farmers/buyers"
echo "      ✓ Multi-turn conversations"
echo "      ✓ Quick suggestions"
echo "      ✓ Farming & buying tips"
echo "      ✓ Fallback responses (no internet)"
echo ""
echo "   🌦️  Weather Features:"
echo "      ✓ Real-time weather data"
echo "      ✓ Auto-geolocation detection"
echo "      ✓ 5-day forecast"
echo "      ✓ Agricultural recommendations"
echo "      ✓ Weather widget in chat"
echo ""

# 7. Documentation
echo "7️⃣  Documentation"
echo "   ─────────────────────────────────────────────────"
echo "   • CHATBOT_WEATHER_GUIDE.md - Complete setup guide"
echo "   • CHATBOT_IMPLEMENTATION.md - Implementation details"
echo "   • API_ENDPOINTS.md - All API endpoints"
echo ""

# 8. Troubleshooting
echo "8️⃣  Quick Troubleshooting"
echo "   ─────────────────────────────────────────────────"
echo ""
echo "   ❌ Chatbot not responding?"
echo "      1. Check GROQ_API_KEY in backend/.env"
echo "      2. Verify API key has available quota"
echo "      3. Check network connection"
echo "      4. Server falls back to mock responses"
echo ""
echo "   ❌ Weather not showing?"
echo "      1. Check VITE_WEATHER_API_KEY in .env"
echo "      2. Verify API key is correct"
echo "      3. Check location format (city name)"
echo "      4. Try using coordinates instead"
echo ""
echo "   ❌ CORS errors?"
echo "      1. Verify VITE_API_BASE_URL matches backend port"
echo "      2. Check backend is running on port 4000"
echo "      3. Check console for exact error message"
echo ""

# 9. Support
echo "9️⃣  Support & Resources"
echo "   ─────────────────────────────────────────────────"
echo "   • Groq API: https://console.groq.com/docs"
echo "   • OpenWeatherMap: https://openweathermap.org/api"
echo "   • OpenAI API: https://platform.openai.com/docs"
echo "   • Ollama: https://ollama.ai"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "✅ Setup Instructions Complete!"
echo ""
echo "Next steps:"
echo "1. Get API keys (follow steps above)"
echo "2. Update .env files with API keys"
echo "3. Start backend (Terminal 1)"
echo "4. Start frontend (Terminal 2)"
echo "5. Open http://localhost:8080"
echo "6. Click the chat button in bottom-right corner"
echo ""
echo "═══════════════════════════════════════════════════════════════"
