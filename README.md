# Better Chat

A Next.js application with Supabase integration, built for collaborative development between humans and AI agents.

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account and project

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

2. Set up your Supabase credentials:
   - Copy `.env.local.example` to `.env.local`
   - Replace the placeholder values with your actual Supabase project credentials

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

This project follows a structured approach to ensure maintainability and scalability:

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for backend services
- **ESLint** for code quality

## Development Guidelines

### For AI Agents
Please read and follow the [AI Coding Guidelines](AI_CODING_GUIDELINES.md) before making any changes. These guidelines ensure consistent code quality and maintainability.

### For Human Developers
- Follow the established patterns in the codebase
- Reference the AI Coding Guidelines for best practices
- Use TypeScript strictly with proper type definitions
- Write clear, descriptive commit messages
- Test your changes thoroughly

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database, Auth, Real-time)
- **Development**: ESLint, TypeScript

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
