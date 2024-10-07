import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { supabaseUserId, ...jobData } = req.body;

    try {
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          user_id: supabaseUserId,
          ...jobData,
        })
        .select();

      if (error) throw error;

      res.status(200).json(data[0]);
    } catch (error) {
      console.error('Error adding job application:', error);
      res.status(500).json({ error: 'Failed to add job application' });
    }
  } else if (req.method === 'GET') {
    const { supabaseUserId } = req.query;

    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', supabaseUserId);

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching job applications:', error);
      res.status(500).json({ error: 'Failed to fetch job applications' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}