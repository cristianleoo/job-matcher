Create a new page that enables users to build a resume from scratch. This feature is especially beneficial for users who do not have an existing resume or wish to create a new one.

1. User Onboarding
Initial Options:
Present the user with options to kickstart the resume-building process:
Upload Existing Documents:
PDF of an existing resume.
LinkedIn profile URL.
Portfolio links or files.
Start from Scratch:
Proceed directly to the information-gathering survey.
2. Information Gathering Survey
Survey Format:

Display questions one at a time in a clean, survey-like interface (avoid chat-style presentation).
Use progress indicators to show completion status.
Essential Sections to Cover:

Personal Information:
Full name, contact details, professional summary.
Education:
Degrees, institutions, graduation dates.
Work Experience:
Job titles, companies, durations, responsibilities, achievements.
Skills:
Technical skills, soft skills, languages.
Certifications & Awards:
Relevant certifications, honors, and awards.
Projects:
Notable projects, roles, outcomes.
References:
Optionally collect references or state "Available upon request."
User Guidance:

Provide tooltips or examples to help users understand what information is needed.
Include options to skip non-mandatory sections.
3. Resume Generation Process
Data Processing:

If the user uploaded documents or links:
Parse and extract relevant information using appropriate APIs or services.
Pre-fill survey fields with extracted data for user verification.
Generating Resume:

Upon completion of the survey, initiate the resume generation.
Display a loader or progress bar to indicate the process is underway.
4. Resume Rendering and Editing
Rendering the Resume:

Display the generated resume using components similar to @resume-editor.tsx and @PDFViewer.tsx.
Ensure the layout is professional and adheres to modern resume standards.
Editing Capabilities:

Allow users to:
Edit any section of the resume inline.
Add or remove sections as needed.
Choose from different templates or styles.
Real-Time Preview:

Implement a split-view or toggle to preview changes in real-time.
5. Post-Generation Options
Download & Share:

Provide options to download the resume as a PDF.
Enable sharing via email or social media platforms.
Save Progress:

Allow users to save their resume within their account for future edits.
Implement auto-save functionality to prevent data loss.
Feedback Mechanism:

Encourage users to provide feedback on the resume generation process.
Use feedback to improve the service continually.
Technical Considerations
Frontend Development:

Utilize React components for a responsive and dynamic user interface.
Reuse existing components (@resume-editor.tsx, @PDFViewer.tsx) to maintain consistency.
Backend Services:

Implement APIs for:
File uploads and parsing.
Data storage and retrieval.
Resume generation logic.
Data Security:

Ensure all user data is securely transmitted and stored.
Comply with GDPR and other data protection regulations.
Performance Optimization:

Optimize loading times, especially during the resume generation phase.
Use asynchronous operations where appropriate.
Error Handling:

Provide user-friendly error messages for issues like:
Failed file uploads.
Invalid input formats.
Network errors.
User Experience Enhancements
Accessibility:

Ensure the page is accessible to users with disabilities (WCAG compliant).
Internationalization:

Support multiple languages if applicable.
Mobile Responsiveness:

Optimize the interface for mobile and tablet devices.
Help & Support:

Include a help section or chatbot for assistance.
Provide FAQs related to resume building.