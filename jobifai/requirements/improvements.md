# Dashboard
The applications dashboard is not displaying the right number of applications.
We need to add a funnel view showing how many jobs applied, out of those how many interview, how many accepted offer, ...
Additionally, several more charts should be added that will be helpful to see the stats of the performance.


# Chat
The chat should only have chats initiated from the chat page itself, not the other chats. Please find a way to integrate this mechanism. Therefore, if I am generating a resume for a job, or extracting a job from a paste text, that won't show up as a chat. Only chats initiated from the chat page will show up there.

# Interview Prep
For every job application there should be an interview prep button in the table. If clicked this will open a new page where the user can choose what stage of the interview prep they are at. This could be preppring for phone screen, prepping for skills assessment, first round of interview, ...
This should prep the user specifically on the company and role, and job description. The model will generate a to do list of things to do in a very nice format, and questions to prepare, as well as the user could click on help me generate answers.
In order to get relevant information for the to do list and questions, the model will search online for interviews examples and what it could be asked for that company, position and job description. 

# Payment
The app will have a freemium model. The applications tracker will be free to use. The chat will have a limit of 50 requests a month. And the options to generate the resume won't be available. The payment systme will be Stripe. And the plan would be 9.90$/week, 19.90$/month, 179.90$/year.

# Resume Builder
I want to create a new page with a functionality that will let me build a resume. This will be particularly useful for users who don't have a resume or they want to build one from scratch. First, it shoulld ask if the user wants to upload a pdf of the resume, linkedin profile or portfolio, or anything that will help gathering information from the user. Then the model would prompt some questions one at a time, it should look like a survey rather than a chat, to get to know the user better, and then it will start generating the resume. Once everything is ready and it's generating the resume a loader should pop up on the screen. Then the resume will be rendered on the screen it will be similar to @resume-editor.tsx , and @PDFViewer.tsx 