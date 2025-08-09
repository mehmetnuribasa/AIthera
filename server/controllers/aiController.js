import pool from "../config/pool.js";
import { GoogleGenAI } from "@google/genai";

export const chatWithAI = async (req, res, next) => {
    try {
        userId = req.user.id; // Get user ID from authenticated request
        
        // chat history from the frontend
        const { history } = req.body;

        const aiHistory = history.map((msg) => ({
            role: msg.role,
            parts: [{text: msg.text}],
        }));

        const ai = new GoogleGenAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
        });

        // Create a chat session with the chat history
        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            history: aiHistory,
        });

        // Send the last user message to the AI
        const stream = await chat.sendMessageStream({
            message: history[history.length - 1].text,
        });

        // Get the response from the AI
        let responseText = "";
        for await (const chunk of stream) {
            responseText += chunk.text;
        }

        res.status(200).json({ message: responseText });
    } catch (error) {
        next(error);
    }
}