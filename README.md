# Nethul Frontend Chatbot (React + Vite + TypeScript)

A modern, minimal, frontend-only chatbot application designed with the look, feel, and personality of **Nethul**.

Built with a pure white background (`#FFFFFF`), mobile-first responsive layout, simulated reasoning & streaming responses, and clean component architecture.

---

## ✨ Features

- **Nethul Aesthetic**: Clean, modern, minimalist pure white theme (`#FFFFFF`) with subtle borders, refined typography, and official geometric avatars.
- **Mobile-First & Responsive**:
  - Touch-friendly action buttons and safe-area padding (`env(safe-area-inset-bottom)`).
  - Slide-out conversation history drawer on mobile and responsive layout on desktop.
- **Message Bubbles**:
  - **User Messages**: Right-aligned sleek dark pills (`bg-black text-white`).
  - **Nethul Bot Messages**: Left-aligned with avatar, markdown formatting, syntax-highlighted code blocks with 1-click **Copy Code** button, and action buttons (Copy, Thumbs Up/Down rating, Regenerate, Share).
- **Thinking / Reasoning Indicator**:
  - Simulates real-time reasoning accordion (`Thought for 1.8s`, expandable step-by-step reasoning logic).
  - Animated pulsing typing dots.
- **Simulated Streaming Output**:
  - Smooth character-by-character response streaming for an ultra-fast, responsive feel.
- **Fixed Bottom Input Bar**:
  - Auto-resizing textarea (grows up to 5 lines).
  - Enter to send, Shift+Enter for newline.
  - Interactive pill toggles: **Fun Mode** (Nethul's witty satirical persona), **DeepSearch**, and **Think** reasoning mode.
  - File attachment preview mock.
  - Energetic circular send button with disabled/active state transitions.
- **Empty State with Prompt Suggestions**:
  - Instant one-tap prompt cards (Quantum Superposition, React Custom Hook, Startup Roast, and Philosophy of Nethul).
- **Model Selector Dropdown**:
  - Switch between **Nethul 3 (Deep Reasoning)**, **Nethul 2**, and **Nethul Mini**.
- **Dark Mode Toggle**:
  - Defaults to pure white (`#FFFFFF`) with an optional dark mode toggle in the header.
- **Multi-session Management**:
  - Start new conversations, switch between recent chats, or clear messages.

---

## 🏗️ Clean Component Structure

```
src/
├── components/
│   ├── ChatWindow.tsx      # Core container managing state, streaming & session flows
│   ├── MessageList.tsx     # Message list with auto-scroll & jump-to-bottom floater
│   ├── MessageBubble.tsx   # Left/right bubbles, formatted code blocks & action bar
│   ├── InputBar.tsx        # Bottom bar with auto-resizing input & mode pill toggles
│   ├── TypingIndicator.tsx # Nethul 3 thinking accordion & pulsating typing dots
│   ├── EmptyState.tsx      # Welcome hero with quick-start prompt cards
│   ├── Header.tsx          # Model switcher, Fun mode pill, new chat & theme toggle
│   └── Sidebar.tsx         # Mobile drawer & chat session history manager
├── services/
│   └── mockNethul.ts       # Nethul reply logic (Fun Mode, Normal Mode, code, reasoning)
├── types.ts                # TypeScript interfaces (Message, ChatSession, Models, Modes)
├── App.tsx                 # Root component
├── main.tsx                # React entry point
└── index.css               # Tailwind CSS & custom animations
```

---

## 🚀 Running the App

### 1. Start Development Server
```bash
npm run dev
```

### 2. Build for Production
```bash
npm run build
```

### 3. Preview Production Build
```bash
npm run preview
```


---

## 🤖 OpenRouter API Test Script

A standalone TypeScript script is included to demo streaming chat completions from [OpenRouter](https://openrouter.ai/) using the `@openrouter/sdk`.

### Setup

1. **Set your API key** in the `.env` file at the project root:
   ```env
   VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

### Run the test

```bash
npm run test:openrouter
```

This will:
- Stream a response from the `nvidia/nemotron-3-ultra-550b-a55b:free` model
- Print the answer character-by-character to the console
- Log the reasoning token count from the final chunk

**Example output:**
```
There are **3** r's in the word "strawberry".

Here is the breakdown:
st**r**awbe**rr**y
Reasoning tokens: 19
```

### Changing the model

Edit [`test-openrouter.ts`](file:///c:/Users/nethu/OneDrive/Documents/chat-bot-/test-openrouter.ts) and replace the `model` field with any OpenRouter-supported model ID. Browse available models at [openrouter.ai/models](https://openrouter.ai/models).

---

## 📁 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_OPENROUTER_API_KEY` | Your OpenRouter API key |
| `VITE_DEFAULT_MODEL` | Default model for the chatbot UI (e.g. `x-ai/grok-2-1212`) |

> **⚠️ Important:** Never commit your `.env` file. It is already listed in `.gitignore`.
