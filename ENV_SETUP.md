# Environment Variables Setup for Vercel

## Required Variables

Configure these in Vercel Dashboard → Project Settings → Environment Variables:

### Database (PostgreSQL)
```
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```
**Providers**: Vercel Postgres, Neon, Supabase, PlanetScale, or any PostgreSQL provider.

### NextAuth.js Configuration
```
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="https://your-app.vercel.app"
```
- Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`
- Set `NEXTAUTH_URL` to your Vercel deployment URL

## Optional Variables

### Google Gemini API (for AI features)
```
GOOGLE_GEMINI_API_KEY="your-gemini-api-key"
```

### AWS S3 (for file uploads)
```
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
```

## Database Setup

After first deployment, run database migrations:

```bash
npx prisma db push
```

Or if using migrations:
```bash
npx prisma migrate deploy
```

