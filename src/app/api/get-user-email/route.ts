import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Como estamos usando la clave anónima, simplemente devolvemos el userId como email
    // ya que en nuestro caso, el userId es el email del usuario
    return NextResponse.json({ 
      email: userId,
      userId: userId
    });

  } catch (error) {
    console.error('Error in get-user-email API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

