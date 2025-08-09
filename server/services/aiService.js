import { GoogleGenAI } from "@google/genai";


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

        const recommendationObj = JSON.parse(response.text);
        return recommendationObj;

    } catch (error) {
        next(error);
    }
}