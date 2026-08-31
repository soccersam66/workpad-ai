# Workpad AI

A homework writing app: type or photo-in your questions, get AI to split a worksheet
photo into a clean question list, write your answers on a big touch canvas one question
at a time, then export everything as a PDF.

The AI step (`api/dissect.js`) runs on a small server function so your API key never
sits inside the app itself where someone could find and misuse it.

## 1. Get a free Gemini API key

1. Go to **https://aistudio.google.com/apikey**
2. Sign in with a Google account.
3. Click **Create API key**. Copy it somewhere safe — don't paste it into the app's
   code, and don't share it with anyone. Anyone with this key can make requests that
   count against (and, past the free tier, bill) your account.
4. Google's free tier covers a limited number of requests per day at no cost. Check
   the current limits at https://ai.google.dev/gemini-api/docs/pricing before relying
   on it heavily — limits and pricing can change.

## 2. Deploy to Vercel (free)

**Option A — via GitHub (recommended):**
1. Create a new GitHub repository and push this whole folder to it.
2. Go to https://vercel.com, sign up/sign in (free plan is fine).
3. Click **Add New → Project**, then **Import** your new repository.
4. Before deploying, open **Environment Variables** and add:
   - Name: `GEMINI_API_KEY`
   - Value: *(paste the key from step 1)*
5. Click **Deploy**. Vercel gives you a live URL like `workpad-ai-yourname.vercel.app`
   when it finishes — that's your app.

**Option B — via the Vercel CLI (no GitHub needed):**
1. Install Node.js if you don't have it (https://nodejs.org).
2. In this folder, run:
   ```
   npx vercel
   ```
3. Follow the prompts (log in / sign up when asked).
4. When it asks about environment variables, or once the project exists, run:
   ```
   npx vercel env add GEMINI_API_KEY
   ```
   and paste your key when prompted.
5. Run `npx vercel --prod` to get your live URL.

## 3. Try it

Open your live URL, attach a photo of an assignment, tap **Dissect with AI**, and
check that the questions it fills in actually match the photo — review before you
trust it, it reads worksheets well but not perfectly, especially messy handwriting
or dense math notation.

## Notes / limits

- The AI dissection step needs an internet connection and the Gemini API to be up;
  typed questions and the writing/export flow work with no AI involved at all.
- Your written work and question list are stored only in your browser's local
  storage on whatever device you're using — nothing is stored on a server.
- If you ever suspect your API key leaked (e.g. you accidentally committed it to a
  public GitHub repo), delete it and create a new one at the same Google AI Studio
  link above — the old one keeps working until you do.
