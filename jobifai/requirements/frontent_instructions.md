# Project Overview
JobbifAI is an AI-powered job search assistant designed to streamline the job-hunting process by integrating user profiles, scraping job postings, generating tailored resumes and cover letters, and providing interview preparation assistance. The app leverages cutting-edge technologies to offer personalized job recommendations and actionable insights, helping users land their dream jobs more efficiently.

# Feature Requirements
We will use Next.js, Shadcn, Lucid, Supabase, Clerk. For the LLM API use Gemini.
## User Profile Integration
* LinkedIn Import: Users can import their LinkedIn profiles to populate their experience, skills, and education.
* Portfolio & Resume Upload: Upload or link portfolios (e.g., GitHub, personal websites) and existing resumes.
* Customizable Profile: Manually add details like interests, job preferences, and focus keywords.

## Job Matching
* Job Search Integration: Search for job postings based on preferences like location, industry, and job title.
* Similarity Score Algorithm: Calculate a similarity score between the user's profile and job postings using NLP to analyze skills and experience.
* Adjustable Weights: Users can adjust the importance of different factors like location or specific skills.
* Job Alerts: Set up alerts for job postings with high similarity scores.

## Resume & Cover Letter Generation
* AI-Generated Documents: Automatically generate tailored resumes and cover letters based on the user's profile and job descriptions.
* Editable Templates: Provide templates that users can edit before submitting.
* Multiple Versions: Save different versions of resumes and cover letters for various job roles.

## AI Chatbot Assistance
* Job-Specific Interaction: The chatbot offers suggestions to adjust resumes or cover letters for specific jobs.
* Interview Preparation: Simulate interview questions based on job postings to help users prepare.

## Dashboard & Tracking
* Application Tracking: Track jobs applied for, status updates, and interview schedules.
* Job Search Analytics: Display metrics like the number of applications sent and response rates.
* Document History: Track changes and revisions to resumes and cover letters over time.

## AI-Powered Insights
* Skill Gap Analysis: Analyze common skills required for desired positions and identify any skill gaps.
* Resume Optimization Suggestions: Suggest profile improvements based on higher similarity scores.
* Interview Scheduling & Calendar Integration
* Interview Prep Sessions: Schedule mock interviews or receive study reminders based on upcoming interviews.
* Calendar Syncing: Sync with calendars to track interview schedules.

# Relevant Docs
## Gemini API
### Method: models.generateContent
Generates a model response given an input GenerateContentRequest. Refer to the text generation guide for detailed usage information. Input capabilities differ between models, including tuned models. Refer to the model guide and tuning guide for details.

Endpoint
post
https://generativelanguage.googleapis.com/v1beta/{model=models/*}:generateContent

Path parameters
model
string
Required. The name of the Model to use for generating the completion.

Format: name=models/{model}. It takes the form models/{model}.

Request body
The request body contains data with the following structure:

Fields
contents[]
object (Content)
Required. The content of the current conversation with the model.

For single-turn queries, this is a single instance. For multi-turn queries like chat, this is a repeated field that contains the conversation history and the latest request.

tools[]
object (Tool)
Optional. A list of Tools the Model may use to generate the next response.

A Tool is a piece of code that enables the system to interact with external systems to perform an action, or set of actions, outside of knowledge and scope of the Model. Supported Tools are Function and codeExecution. Refer to the Function calling and the Code execution guides to learn more.

toolConfig
object (ToolConfig)
Optional. Tool configuration for any Tool specified in the request. Refer to the Function calling guide for a usage example.

safetySettings[]
object (SafetySetting)
Optional. A list of unique SafetySetting instances for blocking unsafe content.

This will be enforced on the GenerateContentRequest.contents and GenerateContentResponse.candidates. There should not be more than one setting for each SafetyCategory type. The API will block any contents and responses that fail to meet the thresholds set by these settings. This list overrides the default settings for each SafetyCategory specified in the safetySettings. If there is no SafetySetting for a given SafetyCategory provided in the list, the API will use the default safety setting for that category. Harm categories HARM_CATEGORY_HATE_SPEECH, HARM_CATEGORY_SEXUALLY_EXPLICIT, HARM_CATEGORY_DANGEROUS_CONTENT, HARM_CATEGORY_HARASSMENT are supported. Refer to the guide for detailed information on available safety settings. Also refer to the Safety guidance to learn how to incorporate safety considerations in your AI applications.

systemInstruction
object (Content)
Optional. Developer set system instruction(s). Currently, text only.

generationConfig
object (GenerationConfig)
Optional. Configuration options for model generation and outputs.

cachedContent
string
Optional. The name of the content cached to use as context to serve the prediction. Format: cachedContents/{cachedContent}

Example request
```
// Make sure to include these imports:
// import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "Write a story about a magic backpack.";

const result = await model.generateContent(prompt);
console.log(result.response.text());
```

Response body
If successful, the response body contains an instance of GenerateContentResponse.

### Method: models.streamGenerateContent
Generates a streamed response from the model given an input GenerateContentRequest.

Endpoint
post
https://generativelanguage.googleapis.com/v1beta/{model=models/*}:streamGenerateContent

Path parameters
model
string
Required. The name of the Model to use for generating the completion.

Format: name=models/{model}. It takes the form models/{model}.

Request body
The request body contains data with the following structure:

Fields
contents[]
object (Content)
Required. The content of the current conversation with the model.

For single-turn queries, this is a single instance. For multi-turn queries like chat, this is a repeated field that contains the conversation history and the latest request.

tools[]
object (Tool)
Optional. A list of Tools the Model may use to generate the next response.

A Tool is a piece of code that enables the system to interact with external systems to perform an action, or set of actions, outside of knowledge and scope of the Model. Supported Tools are Function and codeExecution. Refer to the Function calling and the Code execution guides to learn more.

toolConfig
object (ToolConfig)
Optional. Tool configuration for any Tool specified in the request. Refer to the Function calling guide for a usage example.

safetySettings[]
object (SafetySetting)
Optional. A list of unique SafetySetting instances for blocking unsafe content.

This will be enforced on the GenerateContentRequest.contents and GenerateContentResponse.candidates. There should not be more than one setting for each SafetyCategory type. The API will block any contents and responses that fail to meet the thresholds set by these settings. This list overrides the default settings for each SafetyCategory specified in the safetySettings. If there is no SafetySetting for a given SafetyCategory provided in the list, the API will use the default safety setting for that category. Harm categories HARM_CATEGORY_HATE_SPEECH, HARM_CATEGORY_SEXUALLY_EXPLICIT, HARM_CATEGORY_DANGEROUS_CONTENT, HARM_CATEGORY_HARASSMENT are supported. Refer to the guide for detailed information on available safety settings. Also refer to the Safety guidance to learn how to incorporate safety considerations in your AI applications.

systemInstruction
object (Content)
Optional. Developer set system instruction(s). Currently, text only.

generationConfig
object (GenerationConfig)
Optional. Configuration options for model generation and outputs.

cachedContent
string
Optional. The name of the content cached to use as context to serve the prediction. Format: cachedContents/{cachedContent}

Example request

```
// Make sure to include these imports:
// import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "Write a story about a magic backpack.";

const result = await model.generateContentStream(prompt);

// Print text as it comes in.
for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  process.stdout.write(chunkText);
}
```

Response body
If successful, the response body contains a stream of GenerateContentResponse instances.

GenerateContentResponse
Response from the model supporting multiple candidate responses.

Safety ratings and content filtering are reported for both prompt in GenerateContentResponse.prompt_feedback and for each candidate in finishReason and in safetyRatings. The API: - Returns either all requested candidates or none of them - Returns no candidates at all only if there was something wrong with the prompt (check promptFeedback) - Reports feedback on each candidate in finishReason and safetyRatings.

Fields
candidates[]
object (Candidate)
Candidate responses from the model.

promptFeedback
object (PromptFeedback)
Returns the prompt's feedback related to the content filters.

usageMetadata
object (UsageMetadata)
Output only. Metadata on the generation requests' token usage.

# Current File Structure
JOB-MATCHER
└── jobifai
    ├── app
    │   ├── fonts
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components
    ├── lib
    ├── node_modules
    ├── requirements
    │   └── frontent_instructions.md
    ├── .eslintrc.json
    ├── .gitignore
    ├── components.json
    ├── next-env.d.ts
    ├── next.config.mjs
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.mjs
    ├── README.md
    ├── tailwind.config.ts
    └── tsconfig.json

# Rules
* All new components should go in /components and be named like example-component.tsx unless otherwise specified
* All new pages go in /app