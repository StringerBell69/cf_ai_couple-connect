# Couple Memory 💕

A personal relationship memory app that helps couples keep track of each other's preferences, requests, and special moments. Built with **Next.js 15**, **Cloudflare Workers AI**, and **PostgreSQL**.

## 🎯 What is Couple Memory?

Couple Memory is a private PWA designed for two users (in this case, Wendy and Daniel) to:

- **📝 Save notes** about each other's preferences, requests, and important details
- **🤖 Chat with an AI assistant** that has context of all saved notes and can answer questions like "What did Wendy ask me to remember?" or "Does Daniel like sushi?"
- **💾 Save conversations** (optional) - chats are ephemeral by default, but can be saved for later reference
- **📱 Install as a mobile app** via PWA support with iOS "Add to Home Screen" prompt

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Cloudflare Workers AI (Llama 3.1 8B Instruct)
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Auth**: Simple session-based authentication with cookies

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- Cloudflare account (for Cloudflare Workers AI)

### 1. Clone the repository

```bash
git clone https://github.com/StringerBell69/cf_ai_couple-connect.git
cd cf_ai_couple-connect
```

### 2. Install dependencies

```bash
bun install
# or
npm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your credentials:

```env
# PostgreSQL database URL
DATABASE_URL=postgres://user:password@host:5432/couple_connect

# Cloudflare Workers AI credentials
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

#### Getting Cloudflare credentials:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Your **Account ID** is in the URL or on the right sidebar of any page
3. Create an **API Token** at [API Tokens](https://dash.cloudflare.com/profile/api-tokens):
   - Click "Create Token"
   - Use "Workers AI" template or create custom with `Workers AI: Read` permission

### 4. Set up the database

Push the schema to your database:

```bash
bun run db:push
# or
npm run db:push
```

(Optional) Seed the database with initial users:

```bash
npx tsx src/db/seed.ts
```

This creates two users:
- **Wendy** (password: `wendy123`)
- **Daniel** (password: `daniel123`)

### 5. Run the development server

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 How to Use

### Login
Log in as either Wendy or Daniel using the credentials above.

### Notes Tab
- Add notes about your partner's preferences, requests, or important details
- Notes are tagged with your name automatically
- Both users can see all notes

### Chat Tab
- Ask the AI questions about your saved notes
- The AI has full context of all notes and knows who you are
- Examples:
  - "What does Wendy want for her birthday?"
  - "Did I promise Daniel anything recently?"
  - "What are our favorite restaurants?"

### Save Conversations (Optional)
- Toggle the save button (disk icon) in the header to persist conversations
- Access saved conversations via the history button (clock icon)
- By default, chats are ephemeral and cleared on refresh

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/          # Login/logout endpoints
│   │   ├── chat/          # AI chat endpoint (Cloudflare Workers AI)
│   │   ├── conversations/ # Conversation CRUD endpoints
│   │   └── notes/         # Notes CRUD endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main app page
├── components/
│   ├── contexts/          # React contexts (Auth, Notes, Conversations)
│   ├── ui/                # shadcn/ui components
│   ├── ChatView.tsx       # Chat interface
│   ├── NotesView.tsx      # Notes interface
│   └── ...
└── src/
    └── db/
        ├── db.ts          # Database connection
        ├── schema.ts      # Drizzle schema
        └── seed.ts        # Seed script
```

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/notes` | Get all notes |
| POST | `/api/notes` | Create a note |
| DELETE | `/api/notes` | Delete a note |
| POST | `/api/chat` | Send message to AI |
| GET | `/api/conversations` | Get user's conversations |
| DELETE | `/api/conversations` | Delete a conversation |
| GET | `/api/conversations/[id]` | Get messages for a conversation |

## 🤝 Contributing

This is a personal project, but feel free to fork and adapt it for your own couple!

## 📄 License

MIT
