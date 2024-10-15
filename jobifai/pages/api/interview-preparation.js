import { supabase } from '@/lib/supabaseClient'; // Adjust the import based on your setup

export default async function handler(req, res) {
  const { jobId } = req.query;

  if (req.method === 'GET') {
    // Fetch the preparation plan for the given jobId
    const { data, error } = await supabase
      .from('interview_preparation')
      .select('plan')
      .eq('job_id', jobId)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { plan } = req.body;

    // Save the preparation plan for the given jobId
    const { error } = await supabase
      .from('interview_preparation')
      .upsert({ job_id: jobId, plan });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'Plan saved successfully' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
