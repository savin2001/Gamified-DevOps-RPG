
# DevOps Quest 🚀

A gamified, AI-powered companion app designed to guide you through a 48-week DevOps learning journey. Track your progress, earn XP, complete labs, and master cloud engineering with an AI mentor by your side.

## 🌟 Features

- **Gamified Learning**: Earn XP, level up (from Cloud Seedling 🌱 to DevOps Master 👑), and maintain study streaks.
- **Curriculum Roadmap**: A structured 48-week plan broken down into 4 phases (Foundation, Intermediate, Advanced, Mastery).
- **Study Journal**: Rich text logging for daily study sessions with automated Markdown generation for your personal notes.
- **Interactive Lab Hub**: Track lab completion, view objectives, and simulate verification commands.
- **Project Portfolio**: Manage major capstone projects with prerequisites and milestone tracking.
- **Blog & Commit Tracker**: Integrated workflow to encourage "Learning in Public" by logging weekly blogs and GitHub commits.
- **AI Mentor**: Built-in AI chat (powered by Google Gemini) to answer technical questions and provide motivation.
- **Analytics Dashboard**: Visual charts tracking your XP progression and activity history.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **Persistence**: LocalStorage (Client-side only)

## 🚀 Getting Started

### Prerequisites

- Node.js installed
- A Google Gemini API Key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/devops-quest.git
   cd devops-quest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   Ensure `process.env.API_KEY` is available in your environment for the AI features to work.

4. **Run the application**
   ```bash
   npm start
   ```

## 📂 Project Structure

- `components/`: UI components (Dashboard, StudySession, LabHub, AiMentor, etc.)
- `services/`: Business logic for gamification and AI integration.
- `types.ts`: TypeScript definitions for UserStats, Activities, and Curriculum.
- `constants.ts`: Static data for Labs, Projects, XP values, and Levels.

## 🎮 How to Use

1. **Dashboard**: Check your current stats, streak, and recent activity.
2. **Study**: Start a "Study Session" to log what you learned today. Fill out the wizard to generate a structured markdown note.
3. **Labs**: Go to the Lab Hub to view your current week's assignments. Click "Start Lab" to view steps and simulate verification.
4. **Projects**: Tackle major projects. These unlock only after completing prerequisite labs.
5. **Blog**: At the end of a week, use the Blog Hub to log your summary post and GitHub commit.
6. **AI Mentor**: Click the floating chat bubble to ask technical questions or get a hype speech.

## 🛡️ License

This project is open source and available under the [MIT License](LICENSE).
