# 🌌 GemForge Studio (ジェムフォージ スタジオ)

> **A Premium Multi-LLM System Prompt Architect & Agentic Tool Schema Workspace in a Zen Minimalist Aesthetic.**

GemForge Studio is a professional, distraction-free environment for designing, compiling, and testing structured **System Instructions (System Prompts)** and **Function Calling JSON Schemas** for the world's leading AI engines: Google Gemini, OpenAI GPT, and Anthropic Claude.

---

## 🎨 Japanese Zen Minimalist Aesthetic
The user interface has been designed from the ground up to cultivate focus and calm:
*   **Sumi-e Misty Mountain Background**: A subtle, elegant traditional ink-wash painting style wraps the environment.
*   **Washi Paper Translucent Cards**: Off-white and light-beige textures (`#fcfbfa` / `#f5f2eb`) replacing dark digital fatigue.
*   **Vermilion & Indigo Accent System**: Focused interactive elements styled with traditional vermilion red (`#c84b31`) and deep indigo slate-blue (`#3e5066`).

---

## 🚀 Key Features

### 1. Dual-Engine Prompt Architect
*   **Offline Local Generator**: Instantly compile simple inputs into structured prompts using curated templates.
*   **Online Meta-Prompting (Gemini API)**: Insert your Gemini API Key in the settings to invoke Gemini 1.5 Flash as an autonomous Prompt Architect that drafts enterprise-grade, detailed prompts.
*   **Chain-of-Thought (CoT) Cognitive Scaffolding**: Automatically injects structured reasoning stages (Deconstruct, Hypothesize, Verify, and Structure) into all generated prompts.

### 2. Multi-LLM Compilation Target
Select your target LLM Engine to compile your system prompts using provider-native syntax:
*   **Google Gemini**: Structured Markdown with knowledge anchor bindings.
*   **OpenAI GPT**: Declarative imperative Markdown directives.
*   **Anthropic Claude**: Structured XML tag boundaries (`<system_prompt>`, `<cognitive_framework>`, etc.) optimized for Claude's attention mechanism.

### 3. Agentic Tool Schema Generator
Declare capability functions for your agents and get instantly formatted JSON schemas for function-calling:
*   `fetch_web_content` (Live Web Search API)
*   `execute_code` (Python Code Interpreter Sandbox)
*   `read_database` (Database access SQL API)
*   Outputs structured JSON formatted for Google Gemini, OpenAI, or Claude tool declarations.

### 4. Interactive Marketplace (55+ Templates)
*   A library of **55+ expert Gems** categorized across **9 professional categories** (Coding, Design, Finance, Education, Medical, Law, Business, AI Prompting, and Strategy).
*   **Upvote System**: Heart and like counter stored in local storage.
*   **Interactive Review Modals**: Review templates with star ratings and comments.

### 5. Chat Simulator
*   Test and interact with your compiled personas.
*   **Visualized Tool Calls**: Intercepts simulated tools to render step-by-step processing blocks (e.g., executing code or searching the web) before returning final answers.

---

## 🛠️ Technology Stack
*   **Framework**: Next.js 16.2.9 (App Router)
*   **Library**: React 19.2.4
*   **Icons**: Lucide React
*   **Styling**: Pure CSS Custom Properties with Tailwind CSS v4 custom theme tokens.
*   **AI SDK**: `@google/generative-ai`

---

## 💻 Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Build Static/Production Bundle
To build an optimized production build:
```bash
npm run build
```

---

## 🔒 Security & Safe Prompting
GemForge Studio includes advanced security rules in generated prompts to prevent **Prompt Injection** and **System Prompt Leakage**. It also auto-injects regulatory disclaimer banners (e.g., medical, legal, and financial disclaimers) to ground AI systems in compliance.
