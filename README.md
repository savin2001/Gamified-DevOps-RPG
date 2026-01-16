
# DevOps Quest 🚀

**DevOps Quest** is an immersive, gamified learning companion designed to guide aspiring Cloud Engineers through a structured 48-week curriculum. It combines habit-building gamification (XP, Streaks, Levels) with practical tracking tools and an AI mentor to ensure mastery of AWS, Kubernetes, and Infrastructure as Code.

## ✨ Key Features

### 🎮 Gamification Engine
- **Progression System**: Evolve from a *Cloud Seedling 🌱* to a *DevOps Master 👑* by earning XP.
- **Streak Tracking**: Maintain daily discipline with visual streak tracking and motivation.
- **Reward Mechanics**: Earn badges and XP for specific activities like Study Sessions (50 XP), Labs (100 XP), and Projects (200 XP).

### 🔐 Authentication & Experience
- **Quick Load Personas**: One-click access to pre-configured test accounts (SysAdmin, Cloud Architect, Jr. Dev, QA) for rapid testing and demoing.
- **Smart Validation**: Custom, styled tooltips for form inputs that provide immediate feedback without breaking the immersive dark-mode aesthetic.
- **Secure Sessions**: Full JWT-based authentication with bcrypt hashing and state persistence.

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

### Frontend (Client)
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React
- **State**: React Hooks (Local)
- **AI**: Google GenAI SDK

### Backend (Server) - *New!*
- **Runtime**: Node.js, Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT & Bcrypt

---

## 🚀 Getting Started

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Run Frontend
npm run dev
```

### 2. Backend Setup (Local)

To run the full-stack version with the database:

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment:
    - Copy `.env.example` to `.env`
    - Update `DATABASE_URL` with your local PostgreSQL credentials.
4.  Initialize Database:
    ```bash
    npx prisma migrate dev --name init
    ```
5.  Run Server:
    ```bash
    npm run dev
    ```

### 3. Configuration

Create a `.env` file in the root directory (or rename `.env.example`):

```env
API_KEY=your_google_gemini_api_key
```

> **Note**: An API Key is required for the AI Mentor and Verification features. You can get one at [aistudio.google.com](https://aistudio.google.com).

---

## 🧭 How to Use

1.  **Login**: Use the **Quick Load** buttons to instantly populate credentials for a test persona (e.g., SysAdmin) and access the dashboard.
2.  **Dashboard**: Check your daily stats. If you haven't logged activity today, your streak is at risk!
3.  **Study**: Use the **Study Session** logger to record videos watched or docs read.
4.  **Labs**: Navigate to **Lab Hub**. 
    - Follow the instructions.
    - Type the verification command in the terminal simulation.
    - Click **Execute & Complete**.
5.  **Review**: Use the "Review Mode" toggle to look back at past labs without editing them.
6.  **Publish**: At the end of the week, go to the **Blog & Commit** tab.
    - Write a summary title and reflection.
    - Paste your real GitHub repo link.
    - **View Artifacts**: Use the Inspector to copy your generated Study Log and Lab Report Markdown.
    - Commit these artifacts to your real GitHub repo to build your public portfolio.

---

## 🤝 Contributing

This project is a personal learning tool, but suggestions are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

MIT License
