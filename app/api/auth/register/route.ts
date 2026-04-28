import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });

    const domain = email.split('@')[1]?.toLowerCase() ?? '';
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || '.edu';
    
    if (allowedDomain.startsWith('.')) {
      if (!domain.endsWith(allowedDomain))
        return NextResponse.json({ error: `Only ${allowedDomain} email addresses are allowed` }, { status: 400 });
    } else {
      if (domain !== allowedDomain)
        return NextResponse.json({ error: `Only ${allowedDomain} email addresses are allowed` }, { status: 400 });
    }

    if (password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

    await connectToDatabase();

    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing)
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      college: domain,
      domain,
      role: 'buyer',
      status: 'active',
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
