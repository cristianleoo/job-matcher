import React from 'react';
import ResumeBuilder from '@/components/ResumeBuilder';

const ResumeBuilderPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Resume Builder</h1>
      <ResumeBuilder />
    </div>
  );
};

export default ResumeBuilderPage;