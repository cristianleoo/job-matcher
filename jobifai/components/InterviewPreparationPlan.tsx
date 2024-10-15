import React, { useState, useEffect } from 'react';

interface InterviewPreparationPlanProps {
  jobId: string;
  onClose: () => void;
}

const InterviewPreparationPlan: React.FC<InterviewPreparationPlanProps> = ({ jobId, onClose }) => {
  const [plan, setPlan] = useState<string>('');
  const [existingPlan, setExistingPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPreparationPlan = async () => {
      try {
        const response = await fetch(`/api/interview-preparation?jobId=${jobId}`);
        if (response.ok) {
          const data = await response.json();
          setExistingPlan(data.plan);
        } else {
          console.error('Failed to fetch preparation plan');
        }
      } catch (error) {
        console.error('Error fetching preparation plan:', error);
      }
    };

    fetchPreparationPlan();
  }, [jobId]);

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Generate an interview preparation plan for the job with ID: ${jobId}. Include networking tips and specific questions to prepare for.`,
          supabaseUserId: '', // Add the appropriate user ID if needed
          context: 'interview-preparation',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate preparation plan');
      }

      const reader = response.body?.getReader();
      let result = '';
      while (true) {
        const { done, value } = (await reader?.read()) ?? { done: true, value: undefined };
        if (done) break;
        result += new TextDecoder().decode(value);
      }

      setPlan(result); // Set the generated plan
    } catch (error) {
      console.error('Error generating preparation plan:', error);
      alert('Failed to generate preparation plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = async () => {
    try {
      const response = await fetch('/api/interview-preparation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId, plan }),
      });

      if (response.ok) {
        alert('Preparation plan saved successfully');
        onClose(); // Close the modal after saving
      } else {
        throw new Error('Failed to save preparation plan');
      }
    } catch (error) {
      console.error('Error saving preparation plan:', error);
      alert('Failed to save preparation plan');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-11/12 shadow-lg rounded-md bg-white">
        <h2 className="text-2xl font-bold mb-4">Interview Preparation Plan</h2>
        {existingPlan ? (
          <div>
            <h3 className="font-bold">Existing Plan:</h3>
            <p>{existingPlan}</p>
          </div>
        ) : (
          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="Write your preparation plan here..."
            className="w-full p-2 border rounded h-40"
          />
        )}
        <button
          onClick={handleGeneratePlan}
          className="mt-4 bg-blue-500 text-white p-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Plan'}
        </button>
        <button
          onClick={handleSavePlan}
          className="mt-4 bg-blue-500 text-white p-2 rounded"
        >
          Save Plan
        </button>
        <button
          onClick={onClose}
          className="mt-2 bg-gray-500 text-white p-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default InterviewPreparationPlan;
