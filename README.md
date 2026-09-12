# FlashyCardy

<details open>
<summary> <b>Brief Review<b></summary>

FlashyCardy is a personal flashcard web app. You sign in, create decks, add cards, study them with a flip session, and (on a paid plan) generate cards with AI from the deck title and description.

The stack is **Next.js 16** (App Router), **React 19**, **Clerk** for auth and billing, **Neon PostgreSQL** with **Drizzle ORM**, **shadcn/ui** + **Tailwind CSS 4**, and the **Vercel AI SDK** (`gpt-5-nano`) for generation.

What you can do:

- Create, edit, and delete **decks** (title + optional description)
- Create, edit, delete, and bulk-delete **cards** (front / back, optional title)
- **Study** a deck: flip, shuffle, keyboard shortcuts, progress
- **Generate 5 AI cards** per request from the deck title and description (paid entitlement)
- Compare plans and upgrade on a dedicated **Pricing** page (Clerk Billing)

Plans and features (configured in the Clerk Dashboard):

| Kind | Slug | Role in the app |
| --- | --- | --- |
| Plan | `free_user` | Default free plan |
| Plan | `paid_user` | Unlimited cards per deck; AI access |
| Feature | `3_deck_limit` | Documented free-plan deck cap |
| Feature | `unlimited_decks` | Bypass the 3-deck limit |
| Feature | `ai_flashcard_generation` | Unlock AI card generation |

Limits enforced on the server (UI is not enough):

- Free: **3 decks** max, **3 cards per deck**
- Paid (`paid_user` / `unlimited_decks`): unlimited decks and cards
- AI: **5 cards** per generation; requires `ai_flashcard_generation` or `paid_user`

Auth is Clerk **modal** Sign In / Sign Up on the landing page. Protected routes (`/dashboard`, `/decks/*`) redirect guests to `/`. Every query and mutation is scoped to the Clerk `userId`.

Demo of the deck page (expand cards, AI generate, study):

<p align="center">
<img src="docs/flashycardy.gif?raw=true" alt="FlashyCardy deck page demo" width="80%"/>
</p>

Project tree (source):

```
src/
├── actions/                 # Server Actions (decks + cards + AI)
├── app/
│   ├── page.tsx             # Landing + Clerk modals
│   ├── dashboard/           # Deck list and plan status
│   ├── pricing/             # Clerk PricingTable
│   └── decks/[deckId]/      # Deck detail + /study
├── components/              # Dialogs, AI controls, shadcn/ui
├── db/
│   ├── schema.ts            # decks + cards
│   ├── queries/             # All Drizzle reads/writes
│   └── populate-example-data.ts
├── lib/
│   ├── billing.ts           # FREE_DECK_LIMIT, FREE_CARD_LIMIT, AI count
│   └── validations.ts       # Zod schemas
└── proxy.ts                 # Clerk route protection
```

Reads go through Server Components → `src/db/queries`. Writes go through Server Actions → query helpers. There are no API routes for database mutations.

</details>

<details open>
<summary> <b>Using FlashyCardy<b></summary>

### Prerequisites

- Node.js 20+ and npm
- A [Clerk](https://clerk.com) application with **Billing** plans/features matching the slugs above
- A [Neon](https://neon.tech) PostgreSQL database
- An [OpenAI](https://platform.openai.com) API key (only required for AI generation)

### Environment

Copy the example file and fill in real values (never commit `.env.local`):

```bash
cp .env.local.example .env.local
```

Required variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
OPENAI_API_KEY=sk-proj-*
```

Clerk Billing must define plans `free_user` / `paid_user` and features `unlimited_decks`, `ai_flashcard_generation`, and `3_deck_limit` in the Clerk Dashboard.

### Install, schema, run

```
    npm install
    npm run db:push
    npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```
    npm run build
    npm run start
    npm run lint
    npm run db:generate
    npm run db:migrate
    npm run db:studio
    npm run db:populate
```

`db:push` applies the current Drizzle schema to Neon. `db:studio` opens Drizzle Studio. `db:populate` seeds two example decks (**Spanish vocabulary**, **British history**) for a **hardcoded Clerk user ID** inside `src/db/populate-example-data.ts` — change that ID to your user before running it. More detail is in `DATABASE_SETUP.md`.

### Clone

```
    git clone https://github.com/issaiass/FlashyCardy.git
    cd FlashyCardy
    npm install
```

### Routes

```
    /                         # Public landing; signed-in users go to /dashboard
    /dashboard                # Your decks, plan badge, create deck
    /decks/<deckId>           # Cards, edit/delete deck, AI generate, start study
    /decks/<deckId>/study     # Flip study session
    /pricing                  # Clerk <PricingTable />
```

### Typical flow

1. Sign up or sign in from `/` (Clerk modal).
2. Create a deck on `/dashboard` (free plan stops at 3 decks).
3. Open the deck, add cards (free plan stops at 3 cards per deck).
4. Paid users: add a description, then **Generate cards with AI** (5 cards per click).
5. **Start studying**: Space to flip, ← / → to move, shuffle when you want a new order.
6. Upgrade on `/pricing` when you hit a limit.

</details>

<details open>
<summary> <b>Results<b></summary>

The GIF below is the live deck screen: card list, expand/collapse, and the study / AI / add-card actions.

<p align="center">
<img src="docs/flashycardy.gif?raw=true" alt="FlashyCardy application demo" width="85%"/>
</p>

What the recording shows:

- Deck overview (card count, created / updated dates)
- Expandable cards with front and back
- Generate cards with AI and add card
- Start studying from the deck page

The GIF is stored in-repo at `docs/flashycardy.gif`.

</details>

<details open>
<summary> <b>Video Explanation<b></summary>

An explanatory walkthrough of the code and billing setup is planned. The GIF in **Results** is the current visual demo.

When a video is published, it will be linked here.

</details>

<details open>
<summary> <b>Issues<b></summary>

- Dashboard **progress** and **cards studied today** are placeholders (always 0). Study sessions are not persisted.
- **Recent Activity** is an empty placeholder.
- Some dashboard **Quick Actions** (browse all decks, view statistics, get started) have no handlers yet.
- The toast hook exists but is not wired into the main UI flows.
- Feature slug `3_deck_limit` is documented for Clerk; the app enforces the number `3` in code and gates extras with `unlimited_decks`.
- AI generation is not blocked by the per-deck free card cap; it is gated only by the paid / AI entitlement and writes 5 cards in one batch.
- `drizzle/0001_initial_flashcard_schema.sql` is behind the live schema (`cards.title`). Prefer `npm run db:push` for a matching database.
- `db:populate` targets a fixed Clerk `userId`. It will fail on a second run (duplicate guard).
- Study mode has no spaced repetition, scoring, or “known / unknown” tracking.

</details>

<details open>
<summary> <b>Future Work<b></summary>

Planning to add to this project:

- :x: Persist study sessions and real dashboard statistics
- :x: Spaced repetition (SRS) and known / unknown marking
- :x: Wire toasts into create / update / generate flows
- :heavy_check_mark: Clerk Billing (free vs paid, deck and card limits)
- :heavy_check_mark: AI flashcard generation from deck context
- :heavy_check_mark: Flip study session with keyboard shortcuts
- :x: Explanatory video of the architecture and Clerk feature gates

</details>

<details open>
<summary> <b>Contributing<b></summary>

Your contributions are always welcome! Please feel free to fork and modify the content but remember to finally do a pull request.

Keep the project conventions: Drizzle only through `src/db/queries`, Zod on every server action, Clerk `auth()` + `userId` filters, and `has()` on billing-sensitive mutations.

</details>

<details open>
<summary> :iphone: <b>Having Problems?<b></summary>

<p align="center">

[<img src="https://img.shields.io/badge/linkedin-%230077B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white" />](https://www.linkedin.com/in/riawa)
[<img src="https://img.shields.io/badge/telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white"/>](https://t.me/issaiass)
[<img src="https://img.shields.io/badge/instagram-%23E4405F.svg?&style=for-the-badge&logo=instagram&logoColor=white">](https://www.instagram.com/daqsyspty/)
[<img src="https://img.shields.io/badge/twitter-%231DA1F2.svg?&style=for-the-badge&logo=twitter&logoColor=white" />](https://twitter.com/daqsyspty)
[<img src="https://img.shields.io/badge/facebook-%233b5998.svg?&style=for-the-badge&logo=facebook&logoColor=white">](https://www.facebook.com/daqsyspty)
[<img src="https://img.shields.io/badge/linkedin-%230077B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white" />](https://www.linkedin.com/in/riawe)
[<img src="https://img.shields.io/badge/tiktok-%23000000.svg?&style=for-the-badge&logo=tiktok&logoColor=white" />](https://www.linkedin.com/in/riawe)
[<img src="https://img.shields.io/badge/whatsapp-%23075e54.svg?&style=for-the-badge&logo=whatsapp&logoColor=white" />](https://wa.me/50766168542?text=Hello%20Rangel)
[<img src="https://img.shields.io/badge/hotmail-%23ffbb00.svg?&style=for-the-badge&logo=hotmail&logoColor=white" />](mailto:issaiass@hotmail.com)
[<img src="https://img.shields.io/badge/gmail-%23D14836.svg?&style=for-the-badge&logo=gmail&logoColor=white" />](mailto:riawalles@gmail.com)

</p>

</details>

<details open>
<summary> <b>License<b></summary>
<p align="center">
<img src="https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-sa.svg" />
</p>
</details>
