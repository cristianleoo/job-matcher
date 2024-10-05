import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Interface for the user
interface User {
    id?: string;
    clerk_id: string;
    email: string;
    full_name: string;
    created_at?: string;
    updated_at?: string;
}

export async function POST(req: NextRequest) {
    const { userId: clerkId } = auth();

    if (!clerkId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Check if user exists in Supabase
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id, clerk_id, email, full_name')
            .eq('clerk_id', clerkId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching user:', fetchError);
            return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
        }

        if (!existingUser) {
            // If user doesn't exist, fetch user data from Clerk and create in Supabase
            const clerkUser = await clerkClient.users.getUser(clerkId);

            const newUser = {
                clerk_id: clerkId,
                email: clerkUser.emailAddresses[0]?.emailAddress || '',
                full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            };

            const { data: createdUser, error: insertError } = await supabase
                .from('users')
                .insert(newUser)
                .select()
                .single();

            if (insertError) {
                console.error('Error creating user:', insertError);
                return NextResponse.json({ error: 'Error creating user' + insertError }, { status: 500 });
            }

            return NextResponse.json({ message: 'User created', user: createdUser });
        }

        return NextResponse.json({ message: 'User already exists', user: existingUser });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}