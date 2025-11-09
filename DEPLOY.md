# Deployment Guide

## Quick Deploy to Vercel (5 minutes)

### Option 1: Vercel CLI (Fastest)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to web directory
cd web

# Deploy (will ask you to login if first time)
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: sudoku-fun (or your choice)
# - Directory: ./
# - Override settings? No

# For production deployment:
vercel --prod
```

### Option 2: Vercel Dashboard (Easiest)

1. Go to https://vercel.com and sign in (use GitHub)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Important**: Set Root Directory to `web`
5. Framework Preset: Next.js (auto-detected)
6. Click "Deploy"

Done! Your app will be live in ~2 minutes.

## Configuration

### Environment Variables (Optional)

If you add a database or external services later:

```bash
# In Vercel Dashboard → Settings → Environment Variables
DATABASE_URL=your_postgres_url
REDIS_URL=your_redis_url
```

### Custom Domain (Optional)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Post-Deployment

Your app will be available at:
- Production: `https://your-project.vercel.app`
- Preview: Auto-deployed for every git push

### Auto-Deploy on Git Push

Every time you push to your `main` branch, Vercel will:
1. Automatically build your app
2. Run tests (if configured)
3. Deploy to production

Every PR gets its own preview URL!

## Monitoring

- **Analytics**: https://vercel.com/dashboard/analytics
- **Logs**: Vercel Dashboard → Your Project → Deployments → View Logs
- **Performance**: Vercel automatically optimizes images, fonts, etc.

## Troubleshooting

### Build Fails

```bash
# Test build locally first
cd web
npm run build

# If it works locally but fails on Vercel:
# - Check Node version in package.json
# - Check environment variables
```

### Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment

---

**Note**: Vercel's free tier is perfect for this project. You get:
- Unlimited deployments
- Automatic HTTPS
- Global CDN
- Preview deployments
- Serverless functions (for future backend)
