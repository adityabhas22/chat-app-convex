# Real-Time Chat Application

A modern, real-time chat application built with **Convex**, **Next.js 14**, **Clerk**, and **TypeScript**. Features include group chats, direct messaging, friend management, and a beautiful responsive UI.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery using Convex's real-time database
- **User Authentication**: Secure authentication with Clerk (supports OAuth, email/password)
- **Friend System**: Search users, send/accept friend requests
- **Group Chats**: Create group conversations with multiple members
- **Direct Messages**: Private 1-on-1 conversations
- **Profile Pictures**: User avatars from Clerk authentication
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **Type-Safe**: Full TypeScript support across frontend and backend

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, Tailwind CSS
- **Backend**: Convex (serverless backend with real-time database)
- **Authentication**: Clerk
- **Language**: TypeScript
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- A Convex account (sign up at [convex.dev](https://convex.dev))
- A Clerk account (sign up at [clerk.com](https://clerk.com))

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd chat-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Convex

1. **Login to Convex**:

   ```bash
   npx convex dev
   ```

   This will:
   - Prompt you to log in to Convex
   - Create a new project
   - Generate the `convex/_generated` folder with type definitions
   - Give you your `NEXT_PUBLIC_CONVEX_URL`

2. **Keep the terminal running** (Convex dev needs to run in the background)

### 4. Set Up Clerk Authentication

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application
3. Get your API keys from the dashboard
4. Configure your application:
   - Add `http://localhost:3000` to allowed redirect URLs
   - Enable the authentication methods you want (Email, Google, GitHub, etc.)

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Convex (from step 3)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk (from step 4)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs (already configured)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 6. Run the Application

**Terminal 1** - Convex Backend (if not already running):

```bash
npm run convex:dev
```

**Terminal 2** - Next.js Frontend:

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
chat-app/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Home page (main chat interface)
│   ├── layout.tsx           # Root layout with providers
│   ├── sign-in/             # Clerk sign-in page
│   └── sign-up/             # Clerk sign-up page
├── components/
│   ├── chat/                # Chat-related components
│   │   ├── chat-layout.tsx  # Main chat layout
│   │   ├── sidebar.tsx      # Conversations sidebar
│   │   ├── chat-window.tsx  # Message display and input
│   │   ├── user-search.tsx  # Friend search and requests
│   │   └── create-group-modal.tsx  # Group creation
│   └── providers/
│       └── convex-provider.tsx  # Convex client provider
├── convex/                   # Convex backend
│   ├── schema.ts            # Database schema definition
│   ├── users.ts             # User management functions
│   ├── friendships.ts       # Friend request functions
│   ├── groups.ts            # Group/chat functions
│   ├── messages.ts          # Message functions
│   └── _generated/          # Auto-generated types (DO NOT EDIT)
├── hooks/
│   └── use-sync-user.ts     # Clerk-Convex user sync hook
└── middleware.ts            # Clerk authentication middleware
```

## 🗄️ Database Schema

### Tables

- **users**: User profiles synced from Clerk
- **friendships**: Friend relationships and requests
- **groups**: Chat groups (both group chats and DMs)
- **groupMembers**: Many-to-many relationship for group membership
- **messages**: Chat messages

## 🎯 Usage Guide

### Creating an Account

1. Navigate to the sign-up page
2. Create an account using email or OAuth providers
3. You'll be automatically redirected to the chat interface

### Adding Friends

1. Click the "Add Friend" button in the sidebar
2. Search for users by username or email
3. Send a friend request
4. Wait for the friend to accept your request

### Starting a Direct Message

1. Search for a friend in the user search modal
2. Click "Chat" next to an accepted friend
3. Start messaging!

### Creating a Group Chat

1. Click the "New Group" button in the sidebar
2. Enter a group name
3. Select friends to add to the group
4. Click "Create Group"
5. Start chatting with your group!

### Sending Messages

1. Select a conversation from the sidebar
2. Type your message in the input field at the bottom
3. Press Enter or click "Send"
4. Messages appear instantly for all participants

## 🚀 Deployment

### Deploy Convex Backend

```bash
npm run convex:deploy
```

This will give you a production Convex URL. Update your production environment variables.

### Deploy Next.js Frontend

You can deploy to Vercel, Netlify, or any platform that supports Next.js:

**Vercel (Recommended)**:

```bash
npm install -g vercel
vercel
```

Make sure to add all environment variables in your deployment platform's settings.

## 🔐 Security Notes

- Never commit `.env.local` to version control
- Keep your Clerk secret keys private
- The middleware ensures all routes except sign-in/sign-up require authentication
- User data is synced securely between Clerk and Convex

## 🎨 Customization

### Styling

- Edit `app/globals.css` for global styles
- Tailwind CSS classes are used throughout components
- Color scheme can be customized in Tailwind config

### Database Schema

- Modify `convex/schema.ts` to add new fields or tables
- Backend functions automatically get type-safety from the schema

### Authentication

- Configure additional OAuth providers in Clerk dashboard
- Customize authentication flows in Clerk settings

## 🐛 Troubleshooting

### Convex Connection Issues

- Ensure `npx convex dev` is running
- Check that `NEXT_PUBLIC_CONVEX_URL` is correct in `.env.local`
- Clear browser cache and restart dev server

### Authentication Issues

- Verify Clerk API keys are correct
- Check that redirect URLs are configured in Clerk dashboard
- Ensure middleware.ts is not blocking required routes

### Type Errors

- Run `npx convex dev` to regenerate types
- Restart your TypeScript server in your IDE

## 📚 Learn More

- [Convex Documentation](https://docs.convex.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Convex](https://convex.dev) - The reactive backend
- Authentication by [Clerk](https://clerk.com)
- UI components styled with [Tailwind CSS](https://tailwindcss.com)
- Icons from [Lucide](https://lucide.dev)

---

**Happy Chatting! 💬**
