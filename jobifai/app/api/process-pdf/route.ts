import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import { pdfToText } from 'pdf-ts';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}.${fileExtension}`;

    // Save the file to Supabase
    const { data, error } = await supabase.storage
      .from('user_resumes')
      .upload(`public/${fileName}`, file, {
        cacheControl: '3600000000',
        upsert: true
      });

    if (error) throw error;

    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfText = await pdfToText(new Uint8Array(arrayBuffer));

    // Use Gemini to process the extracted text
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `
      Extract relevant information from the following resume text and format it as a JSON object with the following structure:
      {
        "firstName": "",
        "lastName": "",
        "email": "",
        "phone": "",
        "location": "",
        "bio": "",
        "skills": ["skill1", "skill2", ...],
        "workExperience": [
          {
            "company": "",
            "position": "",
            "startDate": "",
            "endDate": "",
            "description": ""
          }
        ],
        "education": [
          {
            "institution": "",
            "degree": "",
            "fieldOfStudy": "",
            "graduationDate": ""
          }
        ],
        "portfolioLinks": ["link1", "link2", ...],
        "jobPreferences": {
          "desiredPosition": "",
          "desiredIndustry": "",
          "desiredSalary": "",
          "remotePreference": ""
        },
        "linkedinProfile": "",
        "githubProfile": "",
        "personalWebsite": ""
      }

      Ensure all fields are filled with the available information. Use empty strings for missing information. For arrays, provide an empty array if no information is found. The output should be valid JSON without any additional text or formatting.

      Resume text:
      ${pdfText}
    `;

    const result = await model.generateContent([{ text: prompt }]);
    const generatedText = result.response.text();

    // Extract JSON from the generated text
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in the generated text');
    }

    const jsonString = jsonMatch[0];

    // Attempt to parse the extracted JSON
    try {
      const parsedJson = JSON.parse(jsonString);
      return NextResponse.json({ text: JSON.stringify(parsedJson) });
    } catch (parseError) {
      console.error('Error parsing generated JSON:', parseError);
      return NextResponse.json({ error: 'Failed to generate valid JSON from resume' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
  }
}