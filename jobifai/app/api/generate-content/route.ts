import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  const { prompt, currentContent, section, jobDescription } = await req.json();

  try {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are a helpful assistant that tailors resume content to job descriptions. Only use information provided in the resume. Do not invent or assume any new information. Provide only the improved content without any additional text or formatting." }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I'll provide only the improved content without any additional text or formatting." }],
        },
      ],
    });

    let systemPrompt = "";
    switch (section) {
      case 'summary':
        systemPrompt = "Create a brief professional summary that highlights why the candidate is a good fit for the position based on their resume and the job description. Do not invent new information. Provide only the summary text:";
        break;
      case 'skills':
        systemPrompt = "Provide a comma-separated list of the most relevant skills from the resume that match the job description. Only include skills mentioned in the resume. Provide only the list of skills:";
        break;
      case 'experience':
        systemPrompt = "Improve the job description to better match the job posting. Only use information provided in the original description. Provide only the improved bullet points:";
        break;
      default:
        throw new Error("Invalid section specified");
    }

    const result = await chat.sendMessage(`${systemPrompt}\n\nJob Description:\n${jobDescription}\n\nCurrent Content:\n${currentContent}\n\nImproved Content:`);
    const response = await result.response;
    let generatedContent = response.text().trim();

    // Remove any labels or formatting that might have been added by the AI
    generatedContent = generatedContent.replace(/^(Improved Content:|Summary:|Skills:|Experience:)\s*/i, '');
    generatedContent = generatedContent.replace(/^["']|["']$/g, ''); // Remove leading/trailing quotes if present

    return NextResponse.json({ generatedContent });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({ error: 'Error generating content' }, { status: 500 });
  }
}
