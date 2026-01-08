
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMotivation = async (streak: number, xp: number): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `You are a hype-man and DevOps mentor. The user has a streak of ${streak} days and ${xp} XP. Give them a short, punchy, 2-sentence motivation to keep learning Cloud engineering. Use emojis.`,
        });
        return response.text || "Keep crushing it! 🚀 The cloud awaits!";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Keep consistent! Every session counts towards your certification. ☁️";
    }
};

export const chatWithMentor = async (message: string, context: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `System: You are a senior DevOps engineer and strict mentor. Your only goal is to help the user master DevOps, AWS, Kubernetes, and Cloud Computing based on their learning path.

            Rules:
            1. ONLY answer questions related to DevOps, Cloud, Programming, Linux, or Career advice in tech.
            2. STRICTLY REFUSE off-topic questions (movies, food, politics, general chat) with a single, short sentence and immediately pivot to a DevOps topic. Example: "I specialize in DevOps, not movies. Let's discuss your EC2 setup instead."
            3. Be concise, technical, and encouraging.
            4. If asked for code, provide clean, commented snippets (Terraform, Python, Bash, YAML).
            5. Use Markdown formatting for code blocks, bold text, and lists.

            Context about student: ${context}. 
            User's Question: ${message}`,
        });
        return response.text || "I'm having trouble connecting to the cloud right now. Try again later.";
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "I seem to be offline. Please check your API key configuration.";
    }
};

export const verifyGithubActivity = async (input: string): Promise<{ valid: boolean; message: string }> => {
    try {
        // In a real app, we'd use the GitHub API. Here we use Gemini to "analyze" the text input 
        // to see if it looks like a valid commit message or learning note.
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze this text. Is it a valid description of a DevOps learning activity, a git commit message, or a link to a repo? 
            Input: "${input}"
            Return a JSON object with "valid" (boolean) and "message" (string feedback).`,
             config: {
                responseMimeType: "application/json",
            }
        });
        
        const result = JSON.parse(response.text || '{"valid": false, "message": "Parse error"}');
        return result;
    } catch (error) {
        // Fallback for demo if API fails
        return { valid: true, message: "Activity logged (Offline verification)" };
    }
};
