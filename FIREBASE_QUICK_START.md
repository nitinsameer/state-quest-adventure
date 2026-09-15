# Firebase Analytics - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Get Credentials (2 minutes)
1. Go to https://console.firebase.google.com
2. Create project or select existing
3. **Project Settings** → Copy these values:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID
   - Measurement ID

### Step 2: Add to .env.local (1 minute)
```bash
# Copy the template
cp .env.local.example .env.local

# Edit and paste credentials
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Step 3: Build & Deploy
```bash
npm run build
# Deploy as usual (Vercel, etc.)
```

## ✅ Verify It Works

1. Build succeeds: `✅ Firebase initialized successfully`
2. Open app in browser
3. Go to Firebase Console → **Analytics** → **Real-time**
4. You should see events firing live!

## 📊 Key Events to Watch

| Event | What It Tracks | Example |
|-------|---|---|
| `session_start` | User opens app | New session begun |
| `quiz_complete` | Quiz finished | User scored 67% on Karnataka |
| `state_completed` | State 100% done | Karnataka state unlocked |
| `first_state_completed` | First state ever | Onboarding milestone |
| `crash` | App errors | Javascript runtime error |
| `daily_visit` | User active today | Streak = 7 days |
| `streak_milestone` | 3/7/14/30 day streak | Long-term engagement |

## 🔍 Check Events in Firebase Console

1. **Real-time Tab**: See events firing live (5-10 second delay)
2. **Events Tab**: View all events (24 hour delay)
3. **Dashboards**: Create custom metrics
4. **Audience**: Build user segments (e.g., "Age 8-9 with 7+ day streak")

## 📈 Sample Metrics to Track

```
Engagement: quiz_complete / quiz_start
Retention: streak_milestone >= 7 / session_start
Quality: crash count / session_start count
New Users: profile_created count
Milestones: first_state_completed / profile_created
```

## 🆘 Troubleshooting

### Events not showing in Firebase Console?
- ✅ Check `.env.local` has correct credentials
- ✅ Check `npm run build` shows "Firebase initialized successfully"
- ✅ Wait 5-10 seconds (Real-time has delay)
- ✅ Refresh Firebase Console

### Build fails with Firebase errors?
- ✅ Install deps: `npm install firebase`
- ✅ Credentials might be malformed
- ✅ Check `.env.local` is not committed (should be in `.gitignore`)

### Events work in dev but not in production?
- ✅ Add env vars to your deployment platform:
  - **Vercel**: Project Settings → Environment Variables
  - **Firebase Hosting**: Set in `.firebaserc` or deployment config
  - **Docker**: Pass as build args or runtime env

## 📚 Full Documentation

See `FIREBASE_ANALYTICS_IMPLEMENTATION.md` for:
- Complete event reference
- Integration points in code
- Setup instructions
- KPI dashboards
- Advanced configuration

---

**That's it!** Firebase Analytics is now tracking:
- ✅ User engagement (quiz, cards, learning)
- ✅ Progression (states, badges, XP)
- ✅ Retention (daily active, streaks)
- ✅ Quality (crashes, errors, timeouts)
- ✅ Onboarding success metrics
