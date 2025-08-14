import { GoogleGenAI } from "@google/genai";
import pool from "../config/pool.js";


// @desc Get therapy recommendation based on user profile and GAD-7 results
// @route GET /api/ai/recommendation
export async function getTherapyRecommendation(profile, gad7Result) {
    try {
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const prompt = `
            You are a clinical psychologist with over 40 years of experience specializing in psychotherapy and mental health assessments. Your expertise includes matching patients to the most appropriate therapy method based on their symptoms, diagnosis, and overall well-being.
            You will now evaluate the following user's information and GAD-7 anxiety test result.
            Based on this information, choose the most suitable therapy type and number of sessions. The therapy type must be one of the following:
            - CBT (Cognitive Behavioral Therapy): Best for moderate to severe anxiety, negative thought patterns, or when structured skill-building is needed.
            - ACT (Acceptance and Commitment Therapy): Good for mild to moderate anxiety, emotional avoidance, or when values-based action is important.
            - Mindfulness: Suitable for minimal or mild anxiety, stress management, or when the main issue is rumination or lack of present-moment awareness.
            - EMDR (Eye Movement Desensitization and Reprocessing): Best for trauma, PTSD, or when distressing memories are present.
            - DBT (Dialectical Behavior Therapy): Useful for emotional regulation problems, self-harm, or when there are difficulties with relationships and impulse control.

            Very Important:
            - Recommend a **combination of two therapy types** (e.g., ["CBT", "EMDR"]) **only if the user's symptoms clearly justify it**.
            - Do **not suggest more than one therapy** unless a single therapy method is clearly insufficient to address the user’s complex issues.
            - Do **NOT always recommend CBT**. Evaluate each case based on **age, gender, stress level, sleep, medication use**, and **GAD-7 score**.
            - Recommend **DBT** if there are signs of emotional dysregulation, unstable relationships, impulse control issues, or frequent mood swings — even if self-harm is not directly mentioned.
            - Recommend **EMDR** if there are strong signs of trauma, past abuse, or distressing memories, even if PTSD is not explicitly mentioned.
            - If GAD-7 score is **0-9**, consider **Mindfulness or ACT** first.
            - Provide a brief clinical justification for your recommendation.
            - In the JSON response, use ONLY the abbreviated therapy type names: "CBT", "ACT", "Mindfulness", "EMDR", "DBT". Do NOT use full names or descriptive text in the "therapy_types" field.

            In the "explanation" field, provide a concise but information-dense context the assistant can reuse during chat:
            - Patient summary: age, gender, stress level, sleep pattern, medication use, and a 1-2 sentence synthesis of their main concern based on the open-ended answer.
            - GAD-7 summary: total score and severity (minimal/mild/moderate/severe), and what that implies for therapy focus.
            - Rationale for selected therapy types: why these were chosen for this patient.
            - Session plan overview: total number of sessions recommended and how the sessions progress from basics to advanced skills (1-2 sentences). Mention which session ranges focus on which themes.

            Keep it 6-10 sentences, clinician-grade, neutral, and reusable as a system context.

            Respond ONLY with a JSON object in the following format. Do NOT include code block markers like \`\`\` or \`\`\`json.
            {
            "therapy_types": ["", ""],
            "session_count": ,
            "explanation": ""
            }

            user information:
            age: ${profile.age},
            gender: ${profile.gender},
            sleep Pattern: ${profile.sleepPattern},
            stress Level: ${profile.stressLevel},
            has Diagnosis: ${profile.hasDiagnosis},
            uses Medication: ${profile.usesMedication},
            dream recall level: ${profile.dreamRecallLevel},
            gad-7 total score: ${gad7Result.totalScore} (0-21 scale, higher is worse)
            
            After completing the GAD-7, the user was asked an open-ended question:
            "What has been the most challenging or concerning issue for you lately?"

            User response:
            "${gad7Result.question8}"

            Please take this answer into account when recommending the most appropriate therapy method.
            
            
            Additionally, based on the chosen therapy type(s) and session count, provide a structured plan for each session.

            For each session:
            - Give a clear "session_topic": the main theme or focus of that session.
            - Give "session_goals": 2-3 specific outcomes we want to achieve or insights we want to gather from the user by the end of the session.
            - Keep the topics aligned with the selected therapy type(s) and the user's specific issues.
            - Ensure topics are progressive (later sessions can build upon earlier ones).
            - Avoid straying too far from the planned session topic.
            - Make the goals concrete and measurable (e.g., "User identifies 3 recurring thought patterns" instead of vague phrases like "User feels better").
            - Limit the plan to the number of sessions recommended above.

            Include this session plan in the JSON response as an array under the key "session_plan", where each item is:
            {
            "session_number": ,
            "session_topic": "",
            "session_goals": ["", ""]
            }`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        
        // Clean up response.text to remove code block markers
        response.text = response.text.trim().replace(/```(?:json)?([\s\S]*?)```/g, "$1").trim();

        const recommendationObj = JSON.parse(response.text);

        console.log('AI Recommendation:', JSON.stringify(recommendationObj, null, 2));
        return recommendationObj;

    } catch (error) {
        next(error);
    }
};

export async function getWelcomeMessage(session, summary) {
    // Generate a AI welcome message
    const welcomeMessage = `
        You are a professional therapist conducting a therapy session.

        ${session.session_number>1 ? "Previous Session Summary and Therapy Context: " + summary : "Therapy Context: " + session.session_explanation}
        
        Current Session:
        - Session Number: ${session.session_number}
        - Session Topic: ${session.topic}
        - Session Goals: ${JSON.stringify(JSON.parse(session.session_goals))}

        This is the first message in this therapy session. 
        Please provide a warm, welcoming introduction that:

        1. Greets the user and acknowledges their commitment to attending the session.
        2. Briefly explains what this session will focus on (based on the topic).
        3. States the session goals in simple, non-technical language.
        4. Sets a collaborative tone by inviting the user to share their current thoughts, feelings, or recent experiences related to the topic.
        5. Emphasizes that the conversation will stay focused on today\'s topic, but the user can request to revisit past points if needed.
        6. Creates a safe, non-judgmental atmosphere.

        Keep it conversational, warm, and human — no more than 3 sentences. Avoid sounding scripted or robotic.`;
    
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });

    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
    });

    const stream = await chat.sendMessageStream({
        message: welcomeMessage,
    });

    let responseText = "";
    for await (const chunk of stream) {
        responseText += chunk.text;
    }

    return responseText.trim();
};

export async function getChatMessage(session, messagesResult, message, summary) {
    console.log('Summary:', summary);

    // Generate a AI response
    const sessionContext = `
        You are a professional therapist conducting a therapy session.

        ${session.session_number>1 ? "Previous Session Summary and Therapy Context: " + summary : "Therapy Context: " + session.session_explanation}

        Current Session:
        - Session Number: ${session.session_number}
        - Session Topic: ${session.topic}
        - Session Goals: ${JSON.stringify(JSON.parse(session.session_goals))}

        During this conversation:
        - Keep all responses relevant to the session topic and goals.
        - Use a warm, empathetic, and encouraging tone.
        - Ask thoughtful, open-ended questions that guide the user toward achieving today's goals.
        - If the user strays far from the topic, gently acknowledge their point, then guide the conversation back to the session's focus.
        - Keep responses concise but impactful — avoid giving too much information at once.
        - Periodically connect the discussion to the session goals, helping the user see their progress.
        - End the session only when the goals have been addressed, or the user has clearly indicated they wish to stop.

        Respond as a supportive, human-like therapist — avoid sounding like a script.`;

    
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });

    // Prepare the chat history for the AI
    const aiHistory = messagesResult.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.message }],
    }));

    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: aiHistory,
    });

    // Send the session context and last user message to the AI
    const stream = await chat.sendMessageStream({
        message: sessionContext + "\n\nUser: " + message,
    });

    let responseText = "";
    // Get the response from the AI
    for await (const chunk of stream) {
        responseText += chunk.text;
    }

    return responseText.trim();
};

export async function getClosingMessage(session, messagesResult, message, summary) {
    // Generate a closing message
    const closingMessage = `
        You are a professional therapist concluding a therapy session.

        ${session.session_number>1 ? "Previous Session Summary and Therapy Context: " + summary : "Therapy Context: " + session.session_explanation}

        Current Session:
        - Session Number: ${session.session_number}
        - Session Topic: ${session.topic}
        - Session Goals: ${JSON.stringify(JSON.parse(session.session_goals))}

        The conversation for this session is now ending because the goals have been addressed or the user has indicated they wish to stop.

        Please provide a warm, supportive closing message that:

        1. Acknowledges the user's participation and effort in the session.
        2. Briefly summarizes the main progress or key insight from today's conversation in simple, encouraging terms.
        3. Reinforces the value of the skills or insights gained today.
        4. Encourages the user to reflect on and apply what they learned before the next session.
        5. Expresses optimism and support for their ongoing journey.
        6. Avoids introducing any new topics or homework unless already discussed earlier.

        Keep it warm, concise, and human — no more than 3 sentences.`;

        
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        // Prepare the chat history for the AI
        const aiHistory = messagesResult.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.message }],
        }));

        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            history: aiHistory,
        });

        // Send the session context and last user message to the AI
        const stream = await chat.sendMessageStream({
            message: closingMessage + "\n\nUser: " + message,
        });

        let responseText = "";
        // Get the response from the AI
        for await (const chunk of stream) {
            responseText += chunk.text;
        }

        return responseText.trim();
};

export async function summarizeSessionInBackground(session, messagesResult, message, closingMessage, summary) {
    const prompt = `
        You are a professional therapist summarizing a completed therapy session.

        ${session.session_number>1 ? "Previous Session Summary and Therapy Context: " + summary : "Therapy Context: " + session.session_explanation}

        Input:
        - Full conversation transcript between therapist and patient.
        - Session Number: ${session.session_number}
        - Session Topic: ${session.topic}
        - Session Goals: ${JSON.stringify(JSON.parse(session.session_goals))}

        Task:
        1. Write a clear, concise **narrative summary** (max 250 words) that captures:
        - The main points discussed during the session.
        - How the patient engaged with the conversation.
        - Progress made toward each session goal (in natural language, not bullet points).
        - Any emotional changes or breakthroughs noticed.
        - Any recurring themes or concerns that emerged.
        - Suggestions for what might be useful to explore in the next session.

        2. Expand the summary to also include **essential ongoing therapy context** so that future sessions can continue smoothly without the full transcript.  
        Include:
        - Key personal details relevant to therapy (age, stress level, sleep pattern, medication use).
        - Latest known GAD-7 score and severity.
        - Core therapy plan or approach being used.
        - Any long-term patterns or challenges observed.
        - Overall direction of treatment.

        3. Clearly indicate:
        - Goal Completion Status: State whether each listed session goal was fully achieved, partially achieved, or not addressed.
        - Information Completeness: State whether all essential background/personal information for ongoing therapy is complete. If not, specify what is missing.
        
        4. Provide a **Wellness Score** from 0 to 100:
        - 0 means severely struggling with no signs of improvement.
        - 100 means thriving, with all goals met and strong emotional regulation.
        - Consider tone, emotional regulation, progress toward goals, and self-reported symptoms.
        - Briefly justify the score in 1-2 sentences.

        Respond ONLY with a JSON object in the following format. Do NOT include code block markers like \`\`\` or \`\`\`json.
        Output Format:
        {
        "summary": "<Your narrative summary here>",
        "wellness_score": <number>
        }

        Guidelines:
        - Base your analysis entirely on the transcript provided in chat history and the provided therapy context.
        - The summary must be **self-contained** so it can serve as the only context for future sessions.
        - Avoid repeating the full transcript; synthesize the most important points.
        - Write warmly but objectively.`;


    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });

    // Prepare the chat history for the AI
    const aiHistory = messagesResult.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.message }],
    }));

    aiHistory.push({
        role: 'user',
        parts: [{ text: message }],
    });

    aiHistory.push({
        role: 'model',
        parts: [{ text: closingMessage }],
    });

    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: aiHistory,
    });

    // Send the session context and last user message to the AI
    const stream = await chat.sendMessageStream({
        message: prompt,
    });

    let responseText = "";
    // Get the response from the AI
    for await (const chunk of stream) {
        responseText += chunk.text;
    }

    
    // Clean up responseText to remove code block markers
    responseText = responseText.trim().replace(/```(?:json)?([\s\S]*?)```/g, "$1").trim();

    const responseObj = JSON.parse(responseText);

    console.log('AI Summary:', JSON.stringify(responseObj, null, 2));

    await pool.query(
        `UPDATE therapy_sessions SET summary = ?, wellness_score = ? WHERE id = ?`,
        [responseObj.summary, responseObj.wellness_score || 0, session.id]
    );

    return responseObj;
};
