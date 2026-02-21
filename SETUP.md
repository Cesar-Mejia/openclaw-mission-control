# Setup Instructions

## Create GitHub Repository and Push

### Option 1: Using GitHub CLI (Recommended)

If you have GitHub CLI installed:

```bash
gh repo create openclaw-mission-control --public --source=. --remote=origin
git push -u origin main
```

### Option 2: Manual GitHub Creation

1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `openclaw-mission-control`
3. Description: "Real-time dashboard for monitoring OpenClaw AI agents"
4. Public/Private: Choose your preference
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

Then run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/openclaw-mission-control.git
git push -u origin main
```

## Next Steps

### 1. Set Up Convex

```bash
# Login to Convex
npx convex login

# Initialize and deploy
npx convex dev
```

This will give you a `NEXT_PUBLIC_CONVEX_URL`.

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Convex URL:

```
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### 3. Seed Sample Data (Optional)

```bash
npx convex run seed:seedAll
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Production

**Convex**:
```bash
npx convex deploy
```

**Vercel** (recommended for Next.js):
```bash
vercel deploy
```

Or use any other hosting platform that supports Next.js.

## Repository URL

After creating the repo, your project will be at:

```
https://github.com/YOUR_USERNAME/openclaw-mission-control
```

Update the README.md with your actual username!
