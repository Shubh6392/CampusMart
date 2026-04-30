import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),

    // Student login with email + password (.edu only)
    CredentialsProvider({
      id: 'student-credentials',
      name: 'Student Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.trim().toLowerCase();
        const domain = email.split('@')[1] ?? '';
        const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || '.edu';

        if (allowedDomain.startsWith('.')) {
          if (!domain.endsWith(allowedDomain)) return null;
        } else {
          if (domain !== allowedDomain) return null;
        }

        await connectToDatabase();
        const user = await User.findOne({ email }).lean() as any;
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return { id: user._id.toString(), email: user.email, name: user.name };
      },
    }),

    // Admin login (hardcoded, no DB)
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD || '';

        if (!adminEmail || !adminPassword) return null;

        if (
          credentials?.email?.trim().toLowerCase() === adminEmail &&
          credentials?.password === adminPassword
        ) {
          return { id: 'admin-fallback', email: adminEmail, name: 'Admin' };
        }
        return null;
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/auth/signin' },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user?.email) return false;
        const domain = user.email.split('@')[1]?.toLowerCase() ?? '';
        const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || '.edu';
        
        if (allowedDomain.startsWith('.')) {
          if (!domain.endsWith(allowedDomain)) return false;
        } else {
          if (domain !== allowedDomain) return false;
        }

        await connectToDatabase();
        await User.findOneAndUpdate(
          { email: user.email },
          {
            name: user.name || '',
            email: user.email,
            image: user.image || undefined,
            college: domain,
            domain,
            status: 'active',
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
      return true;
    },

    async session({ session }) {
      const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();

      if (adminEmail && session?.user?.email?.toLowerCase() === adminEmail) {
        session.user.role = 'admin';
        session.user.id = 'admin-fallback';
        session.user.college = 'Admin';
        return session;
      }

      if (session?.user?.email) {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: session.user.email }).lean() as any;
          if (dbUser) {
            session.user.role = dbUser.role;
            session.user.college = dbUser.college;
            session.user.domain = dbUser.domain;
            session.user.id = dbUser._id.toString();
            session.user.image = dbUser.image;
          }
        } catch (err) {
          console.error('Session DB error:', err);
        }
      }
      return session;
    },
  },
};
