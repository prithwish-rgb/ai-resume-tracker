import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = (modelName: string = "gemini-2.5-flash") => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment variables.");
  }
  return genAI.getGenerativeModel({ model: modelName });
};

function extractJSON(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
    return match[1].trim();
  }
  const firstBracket = text.search(/[{[]/);
  const lastBracket = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  if (firstBracket !== -1 && lastBracket !== -1 && firstBracket < lastBracket) {
    return text.substring(firstBracket, lastBracket + 1);
  }
  return text.trim();
}

/**
 * Extracts job details from raw text (e.g. from an email or a pasted description)
 */
export async function extractJobDetails(text: string) {
  const model = getGeminiModel("gemini-2.5-flash");
  const prompt = `You are an expert HR assistant. Extract the job details from the following text and return the result strictly as a valid JSON object without markdown formatting. Do not wrap in \`\`\`json. The JSON must have these exact keys: "title" (string), "company" (string), "description" (string, a concise 3-4 sentence summary of the role), and "keywords" (array of strings, top 5-10 technical or behavioral skills required). If you cannot find a piece of information, leave it as null or empty array.
  
Text to analyze:
${text.substring(0, 5000)} // Limiting to 5000 chars to avoid token limits
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();
  
  try {
    const jsonStr = extractJSON(responseText);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON:", responseText);
    throw new Error("Failed to extract job details");
  }
}

/**
 * Tailors a list of resume blocks based on a job description
 */
export async function tailorResumeBlocks(blocks: any[], jobDescription: string) {
  const model = getGeminiModel("gemini-2.5-flash");
  const prompt = `You are an expert career coach and ATS optimization specialist. 
I have a list of resume blocks (sections) and a target Job Description.
I want you to rewrite, optimize, and tailor the content of the resume blocks to better align with the job description. Emphasize relevant skills and use keywords from the job description naturally.
Keep the same number of blocks and the same block IDs. Do not make up fake experiences, just highlight the relevant parts of the existing content.

Target Job Description:
${jobDescription.substring(0, 3000)}

Resume Blocks (JSON format):
${JSON.stringify(blocks, null, 2)}

Return strictly a valid JSON array of the updated resume blocks (each block must have id, type, content, and tags). Do not use markdown wrappers like \`\`\`json.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();
  
  try {
    const jsonStr = extractJSON(responseText);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON:", responseText);
    return blocks; // fallback to original blocks on failure
  }
}

/**
 * Generates interview questions based on job description and base resume
 */
export async function generateInterviewPrep(jobDescription: string, resumeText: string) {
  const model = getGeminiModel("gemini-2.5-flash");
  const prompt = `You are a strict technical and behavioral interviewer. 
Based on the following Job Description and the candidate's Resume, generate a list of likely interview questions.
Return strictly a valid JSON object with three keys: "technical" (array of strings, 3-5 role-specific deep dive questions), "behavioral" (array of strings, 3-5 behavioral questions based on their resume), and "systemDesign" (array of strings, 1-2 architecture or problem-solving questions). Do not use markdown wrappers like \`\`\`json.

Job Description:
${jobDescription.substring(0, 2000)}

Candidate's Resume Text:
${resumeText.substring(0, 3000)}
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();
  
  try {
    const jsonStr = extractJSON(responseText);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON:", responseText);
    throw new Error("Failed to generate interview prep");
  }
}

/**
 * Generates negotiation advice
 */
export async function generateNegotiationAdvice(role: string, company: string, location: string = "") {
  const model = getGeminiModel("gemini-2.5-flash");
  const prompt = `You are an expert salary negotiation coach.
Generate strategic advice for negotiating an offer for the role of "${role}" at "${company}" ${location ? `in ${location}` : ""}.
Return strictly a valid JSON object with these keys: 
- "marketRate" (string, estimated salary range), 
- "leveragePoints" (array of strings, specific skills or factors to highlight for this role), 
- "strategy" (string, paragraph of advice on how to approach the recruiter).
Do not use markdown wrappers like \`\`\`json.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();
  
  try {
    const jsonStr = extractJSON(responseText);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON:", responseText);
    throw new Error("Failed to generate negotiation advice");
  }
}
