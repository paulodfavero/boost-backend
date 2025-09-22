import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3333),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_PUBLISHABLE_KEY: z.string(),
  STRIPE_PRO_PLAN_ID: z.string().optional(),
  STRIPE_PRO_PLAN_ID_OLD: z.string().optional(),
  STRIPE_PRO_PLAN_ID_ANNUAL: z.string().optional(),
  STRIPE_PLUS_PLAN_ID: z.string().optional(),
  STRIPE_PLUS_PLAN_ID_ANNUAL: z.string().optional(),
  STRIPE_PLUS_PLAN_ID_OLD: z.string().optional(),
  STRIPE_ESSENCIAL_PLAN_ID: z.string().optional(),
  STRIPE_ESSENCIAL_PLAN_ID_ANNUAL: z.string().optional(),
  SITE_URL: z.string(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('❌ Invalid environment variables', _env.error.format())

  throw new Error('Invalid environment variables.')
}

export const env = _env.data
