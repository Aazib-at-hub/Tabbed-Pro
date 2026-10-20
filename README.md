# Tabbed Pro

Tabbed Pro — Complete SaaS Platform Design & Development Prompt

Act as a world-class SaaS product strategist, UX/UI designer, senior full-stack engineer, and AI product architect.

Your task is to design and build a modern SaaS platform called Tabbed Pro.

1. Product Overview

Tabbed is an AI Prompt Intelligence platform.

The existing Tabbed Chrome Extension helps users improve their prompts while using AI platforms. It analyzes prompts, assigns a Prompt Score, identifies missing components, and optimizes the prompt.

Tabbed Pro expands this experience into a complete SaaS platform.

The product should be positioned as:

“The intelligence layer for how you communicate with AI.”

Think of Tabbed as something similar to how Grammarly helps users improve writing, except Tabbed helps users improve prompts and instructions given to AI.

The SaaS platform should connect with the Tabbed Chrome Extension and allow users to save, analyze, organize, improve, and understand their prompts over time.

2. Main Product Goals

Build a SaaS platform that allows users to:

Save and organize prompts.

View original and optimized versions.

Track Prompt Scores.

Understand why a prompt received a particular score.

Identify missing prompt components.

Track improvement over time.

Create reusable prompt templates.

Use personalized optimization preferences.

Connect their account with the Tabbed Chrome Extension.

Eventually support team collaboration and enterprise AI management.

The architecture should be scalable from:

Individual User → Pro User → Team → Enterprise

3. Target Users

Individual Users

Developers

Students

Content creators

Researchers

Marketers

Entrepreneurs

Designers

AI power users

Future Business Users

Startups

Marketing agencies

Software companies

Sales teams

HR departments

Enterprise organizations

4. Core Product Modules

A. Authentication

Create a modern authentication system.

Support:

Email and password

Google login

Secure sessions

Forgot password

Email verification

User onboarding

After successful login, redirect users to the dashboard.

5. User Onboarding

When a new user signs up, guide them through a short onboarding process.

Ask:

Step 1: What best describes you?

Options:

Developer

Student

Marketer

Content Creator

Researcher

Entrepreneur

Designer

Other

Step 2: What do you mainly use AI for?

Options:

Coding

Research

Writing

Marketing

Business

Learning

Data Analysis

Content Creation

Step 3: Preferred AI platforms

Allow users to select:

ChatGPT

Claude

Gemini

Perplexity

Other

Step 4: Output preference

Allow users to choose:

Concise

Balanced

Detailed

Highly structured

Use this information to create a Personal AI Profile.

This profile should later influence how Tabbed optimizes prompts.

6. Main Dashboard

Create a clean, premium SaaS dashboard.

The dashboard should display:

Welcome Section

Example:

Good morning, Aazib 👋
Let's make your AI prompts smarter today.

Key Statistics Cards

Display:

Total Prompts

Average Prompt Score

Prompts Optimized

Improvement Percentage

Example:

Total Prompts
247

Average Score
72/100

Prompts Optimized
183

Improvement
+24%

Prompt Quality Overview

Create a visual chart showing Prompt Score progression over time.

Allow filters:

Last 7 days

Last 30 days

Last 3 months

All time

The purpose is to show users whether they are becoming better at communicating with AI.

Recent Prompts

Display:

Prompt title

Category

Original score

Optimized score

Date

AI platform

Example:

Build SaaS Landing Page
42 → 86
Coding
Today

Allow users to click a prompt to open detailed analysis.

7. Prompt Vault

Create a central area called:

Prompt Vault

This is where users can save and organize prompts.

Users should be able to:

Create a new prompt

Save prompts from the Chrome Extension

Edit prompts

Delete prompts

Duplicate prompts

Favorite prompts

Search prompts

Filter prompts

Organize prompts into folders

Add tags

Example folders:

📁 Coding
📁 Marketing
📁 Research
📁 Business
📁 Content Creation
📁 Personal

Each prompt card should display:

Prompt title

Prompt Score

Category

Tags

Date created

AI platform

8. Prompt Detail Page

When a user opens a prompt, show a detailed Prompt Intelligence Report.

Header

Display:

Prompt title

Category

Date

AI platform

Overall Prompt Score

Example:

Prompt Score: 72/100

Score Breakdown

Analyze prompts using multiple dimensions.

Suggested scoring categories:

Clarity

Context

Specificity

Constraints

Role Definition

Output Format

Examples

Completeness

Display each category with a visual progress indicator.

Example:

Clarity 90/100
Context 65/100
Specificity 70/100
Constraints 30/100
Role Definition 80/100
Output Format 45/100

Missing Elements

Clearly identify what the prompt is missing.

Example:

Your prompt could be improved by adding:

Specific constraints

Expected output format

Relevant examples

Original vs Optimized

Create a side-by-side comparison.

Original Prompt

Display the user's original prompt.

Optimized Prompt

Display the AI-enhanced version.

Include:

Copy button

Edit button

Save changes

Re-optimize button

Prompt Improvement

Show:

Before Optimization
42/100

After Optimization
86/100

Improvement
+44 points

9. Prompt Optimizer

Create a dedicated Prompt Optimizer page.

The user enters a raw prompt.

Tabbed analyzes it in real time.

The interface should include:

Left Side

Prompt editor.

Right Side

Prompt Intelligence Panel.

Show:

Overall Score

Score breakdown

Missing elements

Improvement suggestions

The score should dynamically update as the user improves the prompt.

Provide a primary button:

Optimize with Tabbed AI

When clicked:

Analyze the prompt.

Understand the user's intent.

Apply the selected optimization mode.

Generate an improved prompt.

Preserve the original meaning.

Improve clarity and structure.

10. Optimization Modes

Allow users to select specialized optimization modes.

General

For everyday prompts.

Coding

Optimize prompts for:

Web development

Software engineering

Debugging

Architecture

APIs

Code reviews

Research

Optimize prompts for:

Deep research

Literature review

Data gathering

Analysis

Marketing

Optimize prompts for:

SEO

Advertising

Email marketing

Social media

Copywriting

Business

Optimize prompts for:

Market research

Startup ideas

Business strategy

Competitor analysis

Learning

Optimize prompts for:

Understanding topics

Study plans

Explanations

Teaching

Content Creation

Optimize prompts for:

YouTube

Blogs

Scripts

Social media

The optimization system should understand the selected mode and adapt the prompt structure accordingly.

11. Personal AI Profile

Create a settings area called:

My AI Profile

Users can define reusable context.

Example:

Profession:
Full Stack Developer

Experience:
Intermediate

Preferred Tech Stack:
Next.js, React, Python, FastAPI

Preferred Response Style:
Detailed and structured

Tabbed should use this context when optimizing prompts.

The goal is to prevent users from repeatedly typing the same personal information into every prompt.

12. Prompt Templates

Create a template marketplace/library.

Categories:

Coding

Marketing

Business

Research

Education

Content Creation

Productivity

Each template should include:

Template title

Description

Category

Prompt preview

Prompt Score

Usage count

Save to Vault button

Allow users to create and save their own templates.

Future capability:

Allow creators to publish templates publicly.

13. Analytics

Create a dedicated Analytics page.

Display:

Prompt Activity

Prompts created

Prompts optimized

Most active days

Prompt Quality

Average score

Score improvement

Best prompt score

Lowest score

Improvement Insights

Example:

Your strongest area is Clarity.

Your most common weakness is Constraints.

Adding output formats could improve your average Prompt Score by approximately 15%.

Categories

Show which categories the user uses most:

Coding

Research

Marketing

Business

Use beautiful charts and visualizations.

14. Chrome Extension Integration

Tabbed Pro should integrate with the existing Tabbed Chrome Extension.

The flow should be:

User writes prompt
↓
Tabbed Extension analyzes prompt
↓
Prompt receives a score
↓
User optimizes prompt
↓
User clicks "Save to Tabbed Pro"
↓
Prompt syncs with cloud
↓
Appears inside Prompt Vault
↓
Analytics automatically update

Users should also be able to:

View extension connection status.

Disconnect the extension.

Sync prompt history.

Control what data is saved.

15. Pricing and Subscription

Create a pricing page.

Free

Include:

Basic prompt scoring

Limited saved prompts

Basic optimization

Limited analytics

Tabbed Pro

Include:

Unlimited saved prompts

Advanced Prompt Intelligence

Personalized AI Profile

Advanced analytics

Unlimited optimization modes

Prompt history

Cloud sync

Premium templates

Future: Tabbed Teams

Include:

Everything in Pro

Shared Prompt Vault

Team templates

Team analytics

Roles and permissions

Company prompt standards

The pricing system should be designed to support Stripe integration.

16. Future Tabbed Teams Architecture

Do not fully build this yet, but design the database and architecture so it can support teams later.

Future capabilities:

Workspaces

Organizations can create workspaces.

Departments

Examples:

Engineering

Marketing

Sales

HR

Shared Prompt Libraries

Teams can create approved prompts.

Prompt Standards

Organizations can define requirements such as:

Every prompt must contain context.

Every customer-facing AI response must follow our company tone.

Prompts must not include sensitive information.

Team Analytics

Managers can view:

AI adoption

Prompt quality

Optimization rate

Most-used workflows

Department performance

17. Navigation

Create a professional sidebar navigation.

⚡ Tabbed

Dashboard

Prompt Intelligence
→ Optimize Prompt
→ Prompt Vault

Library
→ Templates

Analytics

──────────────

Settings
→ My AI Profile
→ Extension

Upgrade to Pro

The navigation should be collapsible.

18. Design Direction

The product should feel:

Premium

Modern

Intelligent

Minimal

Developer-friendly

Professional

Avoid making it look like a generic AI chatbot.

Use a polished SaaS dashboard design.

Visual inspiration should come from modern products such as:

Linear

Vercel

Notion

Raycast

Stripe Dashboard

However, create a unique visual identity for Tabbed.

19. UI Requirements

Include:

Responsive desktop layout

Responsive tablet layout

Responsive mobile layout

Dark mode

Light mode

Smooth animations

Loading states

Empty states

Error states

Toast notifications

Keyboard shortcuts

The UI should prioritize clarity and productivity.

20. Suggested Tech Stack

Use a modern production-ready architecture.

Frontend

Next.js

TypeScript

Tailwind CSS

shadcn/ui

Backend

Next.js API routes or separate backend architecture if required

Database

PostgreSQL

ORM

Prisma or Drizzle

Authentication

Auth.js / NextAuth or a production-ready alternative

Payments

Stripe

Charts

Recharts

AI

Use an LLM API abstraction layer so multiple AI providers can be supported in the future.

The architecture should support:

OpenAI

Anthropic

Google Gemini

without tightly coupling the entire application to one provider.

21. Database Models

Design a scalable database structure for:

User

id

name

email

avatar

subscription plan

createdAt

AIProfile

userId

profession

experienceLevel

preferredTools

preferredOutputStyle

customContext

Prompt

id

userId

title

originalPrompt

optimizedPrompt

category

tags

aiPlatform

createdAt

PromptScore

promptId

overallScore

clarityScore

contextScore

specificityScore

constraintsScore

roleScore

outputFormatScore

examplesScore

completenessScore

PromptInsight

promptId

missingElements

recommendations

strengths

weaknesses

Folder

id

userId

name

Template

id

title

description

category

promptContent

visibility

createdBy

Workspace

Future-ready model for Tabbed Teams.

WorkspaceMember

Future-ready model for team members and permissions.

22. Important Product Principle

Do not build Tabbed Pro as simply a place to store prompts.

The main value proposition should be:

Understand how well you communicate with AI and continuously improve it.

The Prompt Vault is storage.

The Prompt Optimizer is a tool.

The Prompt Intelligence System is the core product.

Everything in the product should reinforce this concept.

23. MVP Development Priority

Build the SaaS in phases.

Phase 1 — Core MVP

Build:

Authentication

User onboarding

Dashboard

Prompt Optimizer

Prompt Scoring

Prompt Vault

Prompt Detail Page

Basic Analytics

Phase 2 — Pro Features

Add:

Personal AI Profile

Advanced analytics

Optimization modes

Cloud synchronization

Chrome Extension integration

Subscription and billing

Phase 3 — Teams

Add:

Workspaces

Shared prompts

Team templates

Roles and permissions

Team analytics

Phase 4 — Enterprise

Add:

Organization-wide AI standards

Prompt governance

Admin dashboard

Department analytics

AI adoption insights

SSO

Advanced security

24. Final Deliverable

Build a polished, production-quality SaaS application.

Start by creating the complete:

Application architecture.

Database schema.

Authentication flow.

Dashboard UI.

Prompt Optimizer.

Prompt Intelligence scoring interface.

Prompt Vault.

Analytics dashboard.

Use realistic sample data where necessary.

The product should feel like a real SaaS startup ready for launch, not a generic dashboard template.

Prioritize:

Excellent UX

Clear information hierarchy

Fast interactions

Scalable architecture

Premium visual design

Strong Prompt Intelligence branding

The final product should establish Tabbed Pro as:

The platform that helps individuals and organizations understand, optimize, standardize, and improve how they communicate with AI.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2bf34e1f-48c4-4146-9fa0-590217654256).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

---

## 🛠️ Implemented Architecture & System Overview

Tabbed Pro has evolved into a full-stack SaaS platform featuring authentication, database persistence, Express backend API, and a multi-provider LLM engine with real-time SSE streaming.

### 🔐 1. Authentication & Onboarding Flow

- **Auth Context (`src/lib/auth-context.tsx`)**: Manages session state, login, signup, password resets, email verification, and profile sync.
- **Auth Views (`src/routes/auth.*.tsx`)**: Complete responsive UI for Login, Signup, Password Reset, and Email Verification.
- **4-Step User Onboarding Wizard (`src/routes/onboarding.tsx`)**: Collects user role, primary AI domain, preferred platforms (ChatGPT, Claude, Gemini), and output preference to build a custom `AIProfile`.
- **Protected Route Guard (`src/components/protected-route.tsx`)**: Enforces authentication and routes non-onboarded users directly to `/onboarding`.

### 🗄️ 2. Backend & Database Persistence

- **Prisma PostgreSQL Schema (`prisma/schema.prisma`)**:
  - `User`, `AIProfile`, `Prompt`, `PromptScore`, `PromptInsight`, `Folder`, `Template`, `Workspace`, `WorkspaceMember`.
- **Express API Server (`src/server/server.ts` & `src/server/api-routes.ts`)**:
  - REST endpoints for User Profiles, Folders CRUD, Prompts CRUD, Templates, and Analytics.
- **Unified API Client (`src/lib/api-client.ts`)**: Single import abstraction layer with seamless fallback to localStorage database engine (`src/lib/db.ts`).

### 🤖 3. Real LLM AI Engine (LLM Abstraction Layer)

- **Multi-Provider Adapter Architecture (`src/server/llm/`)**:
  - `OpenAIAdapter`: `gpt-4o` evaluation & SSE streaming.
  - `AnthropicAdapter`: `claude-3-5-sonnet` evaluation & SSE streaming.
  - `GeminiAdapter`: `gemini-1.5-flash` evaluation & SSE streaming.
  - `MockLLMAdapter`: Offline simulation fallback with token-by-token SSE streaming.
- **SSE Streaming Endpoint (`POST /api/llm/optimize/stream`)**: Real-time token streaming over Server-Sent Events.
- **Live LLM Prompt Evaluation Endpoint (`POST /api/llm/analyze`)**: Evaluates raw prompts across 8 dimensions (Clarity, Context, Specificity, Constraints, Role, Output Format, Examples, Completeness).
- **Dynamic AI Profile Context Injection (`src/server/llm/optimizer-prompt.ts`)**: Seamlessly injects user's profession, stack, and guidelines into prompt optimization requests.
