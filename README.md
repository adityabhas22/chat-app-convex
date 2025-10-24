# Chat App

A real-time chat application for messaging friends and creating group conversations. Built with **Convex**, **Next.js**, **Clerk**, and **TypeScript**.

## Features

- 💬 **Real-time Messaging** - Instant message delivery
- 👥 **Friend System** - Search, send requests, manage connections
- 👫 **Direct Messages** - Private 1-on-1 conversations
- 🎭 **Group Chats** - Create and chat in groups
- 🔐 **Authentication** - Secure OAuth and email/password login with Clerk

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Convex (serverless database)
- **Auth**: Clerk
- **Language**: TypeScript

## Quick Start

### Prerequisites

- Node.js 18+
- Convex account ([convex.dev](https://convex.dev))
- Clerk account ([clerk.com](https://clerk.com))

### Setup

1. **Clone & install**

```bash
git clone https://github.com/adityabhas22/chat-app-convex.git
cd chat-app
npm install
```

2. **Set up Convex**

```bash
npx convex dev
```

Save your `NEXT_PUBLIC_CONVEX_URL` from the output.

3. **Set up Clerk**

- Get your API keys from [dashboard.clerk.com](https://dashboard.clerk.com)
- Add redirect URLs: `http://localhost:3000`, `/sign-in`, `/sign-up`

4. **Configure environment**
   Create `.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

5. **Run**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy Convex

```bash
npm run convex:deploy
```

### Deploy to Vercel

```bash
vercel
```

Add environment variables in Vercel dashboard, then redeploy.

## Project Structure

```
app/              # Next.js pages & layout
components/       # React components (chat, friends, UI)
convex/          # Backend functions & schema
hooks/           # Custom React hooks
middleware.ts    # Clerk auth middleware
```

## Learn More

- [Convex Docs](https://docs.convex.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)

---

**Built with Convex, Clerk, and Next.js** 🚀
