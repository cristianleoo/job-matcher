import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ResumeEditor } from './resume-editor'; // Corrected import to use named import
import PDFViewer from './PDFViewer'; // Import the PDFViewer component

const ResumeBuilder: React.FC = () => {
  const [step, setStep] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resumeData, setResumeData] = useState<any>(null); // Store the generated resume data
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    summary: '',
    skills: [] as string[],
    experience: [] as { position: string; company: string; startDate: string; endDate: string; description: string[] }[],
    education: [] as { institution: string; degree: string; graduationDate: string }[],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserInput(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handleGenerateResume = async () => {
    setLoading(true);
    // Simulate resume generation
    setTimeout(() => {
      // Here you would call your API to generate the resume
      setResumeData({ /* generated resume data */ });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="p-4">
      {loading && <div className="loader">Loading...</div>}
      {!loading && step === 0 && (
        <div>
          <h2>Enter Your Details to Build a Resume</h2>
          <input type="text" name="name" placeholder="Full Name" onChange={handleInputChange} />
          <input type="email" name="email" placeholder="Email" onChange={handleInputChange} />
          <input type="text" name="phone" placeholder="Phone" onChange={handleInputChange} />
          <input type="text" name="location" placeholder="Location" onChange={handleInputChange} />
          <Button onClick={handleNextStep}>Next</Button>
        </div>
      )}
      {!loading && step === 1 && (
        <div>
          <h2>Provide Additional Information</h2>
          <textarea name="summary" placeholder="Professional Summary" onChange={handleInputChange} />
          <textarea name="skills" placeholder="Skills (comma-separated)" onChange={handleInputChange} />
          <Button onClick={handleNextStep}>Next</Button>
        </div>
      )}
      {!loading && step === 2 && (
        <div>
          <h2>Experience and Education</h2>
          {/* Add fields for experience and education */}
          <Button onClick={handleGenerateResume}>Generate Resume</Button>
        </div>
      )}
      {!loading && resumeData && (
        <div>
          <h2>Your Generated Resume</h2>
          <ResumeEditor 
            jobDescription={resumeData.jobDescription} 
            userProfile={resumeData.userProfile} 
            onSave={() => Promise.resolve()} // Updated to return a Promise
          />
          <PDFViewer pdfUrl={resumeData.pdfUrl} onTextExtracted={(text) => console.log(text)} />
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;