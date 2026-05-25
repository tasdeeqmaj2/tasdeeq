import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin as adminPlugin } from 'better-auth/plugins';
import { createAccessControl } from 'better-auth/plugins/access';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── Access control statements ────────────────────────────────────────────────

const statement = {
  user: ['create', 'list', 'update', 'delete', 'ban', 'set-role', 'impersonate'] as const,
  session: ['list', 'revoke'] as const,
} as const;

export const ac = createAccessControl(statement);

// super_admin: full control over users and sessions
export const superAdminRole = ac.newRole({
  user: ['create', 'list', 'update', 'delete', 'ban', 'set-role', 'impersonate'],
  session: ['list', 'revoke'],
});

// admin (Tasdeeq admin): can only create and list non-privileged users
export const adminRole = ac.newRole({
  user: ['create', 'list'],
});

export const userRole = ac.newRole({});

// ─── Better-auth instance ─────────────────────────────────────────────────────

export const auth = betterAuth({
  basePath: '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  emailAndPassword: {
    enabled: true,
    password: {
      hash: (password: string) => bcrypt.hash(password, 12),
      verify: ({ hash, password }: { hash: string; password: string }) =>
        bcrypt.compare(password, hash),
    },
  },

  trustedOrigins: process.env.ALLOWED_ORIGINS?.split(',') ?? [
    'http://localhost:3001',
    'http://localhost:5173', // Vite default port
  ],

  plugins: [
    adminPlugin({
      ac,
      roles: {
        super_admin: superAdminRole,
        admin: adminRole,
        user: userRole,
      },
      defaultRole: 'user',
    }),
  ],

  user: {
    additionalFields: {
      phone: { type: 'string', required: false },
      isSuperAdmin: {
        type: 'boolean',
        required: false,
        defaultValue: false,
        input: false,
      },
      isActive: {
        type: 'boolean',
        required: false,
        defaultValue: true,
        input: false,
      },
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user: Record<string, unknown>) => {
        if (user.isSuperAdmin) {
          throw new Error('The super admin account cannot be deleted');
        }
      },
    },
  },
});

export type Auth = typeof auth;
