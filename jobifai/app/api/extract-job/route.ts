import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: NextRequest) {
	const { content } = await req.json();

	if (!content) {
		return NextResponse.json({ error: 'No content provided' }, { status: 400 });
	}

	try {
		const prompt = `
			Extract the following information from the given job posting:
			1. Job Title
			2. Company Name
			3. Location
			4. Job Description (summarized in 2-3 sentences)

			Format the output as a JSON object with the following keys:
			title, company, location, description

			Job Posting Content:
			${content}
		`;

		const result = await model.generateContent(prompt);
		const extractedData = JSON.parse(result.response.text());

		return NextResponse.json(extractedData);
	} catch (error) {
		console.error('Error extracting job data:', error);
		return NextResponse.json({ error: 'Failed to extract job data' }, { status: 500 });
	}
}