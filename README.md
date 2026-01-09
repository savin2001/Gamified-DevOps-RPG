
# DevOps Quest 🚀

**DevOps Quest** is an immersive, gamified learning companion designed to guide aspiring Cloud Engineers through a structured 48-week curriculum. It combines habit-building gamification (XP, Streaks, Levels) with practical tracking tools and an AI mentor to ensure mastery of AWS, Kubernetes, and Infrastructure as Code.

## ✨ Key Features

### 🎮 Gamification Engine
- **Progression System**: Evolve from a *Cloud Seedling 🌱* to a *DevOps Master 👑* by earning XP.
- **Streak Tracking**: Maintain daily discipline with visual streak tracking and motivation.
- **Reward Mechanics**: Earn badges and XP for specific activities like Study Sessions (50 XP), Labs (100 XP), and Projects (200 XP).

### 🧪 Lab & Project Hub
- **Interactive Terminal**: Simulated environment to verify lab commands and "execute" infrastructure changes.
- **Draft Mode**: Start a lab or project, save your progress, and resume later (`In Progress` state).
- **Review Mode**: Toggle "Review Mode" to safely browse completed lab instructions without accidentally altering submission data.
- **Prerequisite System**: Advanced projects remain locked until foundational labs are completed.

### 📝 Engineering Journal (The "Second Brain")
- **Structured Logging**: A wizard-based interface to log daily study sessions, capturing concepts, tools, and challenges.
- **Mood & Metrics**: Track energy levels, confidence, and focus alongside technical learnings.
- **Markdown Generation**: Automatically compiles your form data into clean Markdown format.

### 📦 Artifact Inspector & Publishing
- **"Learning in Public" Workflow**: The **Blog Hub** aggregates your weekly activities.
- **Auto-Generated Artifacts**: 
    - **Study Logs**: Compiles all daily notes for the week into a single Markdown file.
    - **Lab Reports**: Generates a verification report of all labs completed that week.
- **One-Click Export**: Copy generated Markdown directly to your clipboard to push to your real GitHub repository.

### 🤖 AI Mentor (Powered by Google Gemini)
- **Context-Aware Chat**: An always-on mentor that knows your current level and streak.
- **Motivation Engine**: Get personalized hype speeches when your streak is at risk.
- **Activity Verification**: AI analysis of commit messages and blog titles to ensure validity before awarding XP.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with a custom "Cyber-Glass" aesthetic
- **AI/LLM**: Google GenAI SDK (`@google/genai`) - *Gemini 1.5 Flash & Pro*
- **Visualization**: Recharts for XP velocity tracking
- **Persistence**: Browser `LocalStorage` (Privacy-focused, no backend required)
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/devops-quest.git
cd devops-quest

# Install dependencies
npm install
```

### 2. Configuration

Create a `.env` file in the root directory (or rename `.env.example`):

```env
API_KEY=your_google_gemini_api_key
```

> **Note**: An API Key is required for the AI Mentor and Verification features. You can get one at [aistudio.google.com](https://aistudio.google.com).

### 3. Run Application

```bash
npm run dev
```

---

## 🧭 How to Use

1.  **Dashboard**: Check your daily stats. If you haven't logged activity today, your streak is at risk!
2.  **Study**: Use the **Study Session** logger to record videos watched or docs read.
3.  **Labs**: Navigate to **Lab Hub**. 
    - Follow the instructions.
    - Type the verification command in the terminal simulation.
    - Click **Execute & Complete**.
4.  **Review**: Use the "Review Mode" toggle to look back at past labs without editing them.
5.  **Publish**: At the end of the week, go to the **Blog & Commit** tab.
    - Write a summary title and reflection.
    - Paste your real GitHub repo link.
    - **View Artifacts**: Use the Inspector to copy your generated Study Log and Lab Report Markdown.
    - Commit these artifacts to your real GitHub repo to build your public portfolio.

---

## 🤝 Contributing

This project is a personal learning tool, but suggestions are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

MIT License
