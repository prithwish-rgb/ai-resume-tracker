/**
 * AI integration — uses Anthropic Claude via direct fetch (no SDK dependency).
 * Falls back to heuristics when ANTHROPIC_API_KEY is absent so the app
 * stays fully usable for job-tracking without an API key.
 *
 * All AI routes import from this file; prompts are versioned here.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL              = "claude-sonnet-4-20250514";

// ─── Availability ─────────────────────────────────────────────────────────────
export const isAIEnabled = (): boolean => Boolean(process.env.ANTHROPIC_API_KEY);

export class AIDisabledError extends Error {
  constructor() {
    super(
      "AI features require ANTHROPIC_API_KEY. " +
      "Add it to .env.local or Vercel → Settings → Environment Variables. " +
      "Get a free key at https://console.anthropic.com/"
    );
    this.name = "AIDisabledError";
  }
}

// ─── Core HTTP caller ─────────────────────────────────────────────────────────
async function callClaude(
  userPrompt: string,
  systemPrompt: string,
  maxTokens = 2000,
  attempt    = 0
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AIDisabledError();

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: maxTokens,
      system:     systemPrompt,
      messages:   [{ role: "user", content: userPrompt }],
    }),
  });

  // Retry once on 429 / 5xx
  if (!res.ok) {
    if ((res.status === 429 || res.status >= 500) && attempt === 0) {
      await new Promise(r => setTimeout(r, 900));
      return callClaude(userPrompt, systemPrompt, maxTokens, 1);
    }
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message || `Claude API error ${res.status}`);
  }

  const data = await res.json() as { content?: { type: string; text: string }[] };
  const text = data.content?.find(b => b.type === "text")?.text;
  if (!text) throw new Error("Empty response from Claude");
  return text;
}

/**
 * Parse JSON from Claude response — handles markdown fences and trailing commas.
 */
function extractJSON<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.search(/[{[]/);
    const end   = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
    if (start !== -1 && end > start) {
      const slice = cleaned.slice(start, end + 1).replace(/,(\s*[}\]])/g, "$1");
      return JSON.parse(slice) as T;
    }
    throw new Error(`Model did not return valid JSON. Raw (first 300): ${raw.slice(0, 300)}`);
  }
}

async function callJSON<T>(
  userPrompt: string,
  systemPrompt: string,
  maxTokens = 2000
): Promise<T> {
  const raw = await callClaude(userPrompt, systemPrompt, maxTokens);
  return extractJSON<T>(raw);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Resume Tailoring
// ─────────────────────────────────────────────────────────────────────────────
const SYS_TAILOR = `You are an expert ATS-optimised resume writer with 15+ years of recruiting experience.
Rewrite the candidate's resume to maximally match the job description.
Rules:
- DO NOT fabricate experience, employers, dates, degrees, or metrics
- Mirror the JD's exact keywords and phrasing where the candidate genuinely has that skill
- Use strong action verbs; quantify outcomes where the original already implies a metric
- Output ONLY valid JSON — no markdown fences, no prose outside the JSON`;

export interface TailorResult {
  tailoredContent: string;
  matchScore:       number;
  missingKeywords:  string[];
  suggestions:      string[];
}

export async function tailorResume(
  resumeText: string,
  jobDescription: string
): Promise<TailorResult> {
  if (!isAIEnabled()) throw new AIDisabledError();
  const prompt = `JOB DESCRIPTION:\n${jobDescription.slice(0, 4000)}\n\nCURRENT RESUME:\n${resumeText.slice(0, 6000)}\n\nReturn JSON:\n{"tailoredContent":"<full rewritten resume with labelled sections>","matchScore":<0-100>,"missingKeywords":["<keyword JD needs but resume lacks>"],"suggestions":["<tip>"]}`;
  return callJSON<TailorResult>(prompt, SYS_TAILOR, 3500);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Interview Question Generator
// ─────────────────────────────────────────────────────────────────────────────
const SYS_INTERVIEW = `You are a senior engineering interviewer at a top tech company.
Generate realistic, targeted interview questions based on the JD and candidate resume.
Output ONLY valid JSON — no markdown fences, no prose outside the JSON.`;

export interface InterviewResult {
  technical:            string[];
  behavioral:           string[];
  systemDesign:         string[];
  situational:          string[];
  tipsForEachCategory:  Record<string, string>;
}

export async function generateInterviewQuestions(
  jobDescription: string,
  resumeText:     string,
  numQuestions    = 5
): Promise<InterviewResult> {
  if (!isAIEnabled()) throw new AIDisabledError();
  const n = Math.min(Math.max(numQuestions, 1), 15);
  const prompt = `JOB DESCRIPTION:\n${jobDescription.slice(0, 3000)}\n\nRESUME:\n${resumeText.slice(0, 4000) || "(none provided)"}\n\nGenerate exactly ${n} questions per category. Return JSON:\n{"technical":["<q>"],"behavioral":["<STAR q>"],"systemDesign":["<design q>"],"situational":["<scenario q>"],"tipsForEachCategory":{"technical":"<tip>","behavioral":"<tip>","systemDesign":"<tip>","situational":"<tip>"}}`;
  return callJSON<InterviewResult>(prompt, SYS_INTERVIEW, 2500);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Job Description Parser
// ─────────────────────────────────────────────────────────────────────────────
const SYS_PARSE = `You are a job-posting parser. Extract structured data from raw job descriptions.
Output ONLY valid JSON — no markdown fences, no prose outside JSON.
Use empty strings or arrays when information is absent — never null.`;

export interface ParsedJob {
  title:             string;
  company:           string;
  location:          string;
  salaryRange:       string;
  requiredSkills:    string[];
  niceToHaveSkills:  string[];
  responsibilities:  string[];
  qualifications:    string[];
  workMode:          string;
  summary:           string;
  keywords:          string[];
}

export async function parseJobDescription(rawText: string): Promise<ParsedJob> {
  if (!isAIEnabled()) return heuristicParseJob(rawText);
  const prompt = `Parse this job posting:\n\n${rawText.slice(0, 8000)}\n\nReturn JSON:\n{"title":"","company":"","location":"","salaryRange":"","requiredSkills":[],"niceToHaveSkills":[],"responsibilities":[],"qualifications":[],"workMode":"remote|hybrid|onsite|unknown","summary":"<2-3 sentences>","keywords":[]}`;
  return callJSON<ParsedJob>(prompt, SYS_PARSE, 1800);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Offer Negotiation
// ─────────────────────────────────────────────────────────────────────────────
const SYS_NEGOTIATE = `You are a compensation negotiation coach with deep knowledge of tech salary benchmarks.
Output ONLY valid JSON — no markdown fences, no prose outside the JSON.`;

export interface NegotiationResult {
  script:        string;
  keyPoints:     string[];
  counterOffer:  { base: string; bonus: string; equity: string };
  marketInsight: string;
  doList:        string[];
  dontList:      string[];
}

export async function generateNegotiationScript(params: {
  role:            string;
  company:         string;
  offeredBase:     string;
  offeredBonus?:   string;
  offeredEquity?:  string;
  location:        string;
  yearsExperience: string;
  targetBase?:     string;
}): Promise<NegotiationResult> {
  if (!isAIEnabled()) throw new AIDisabledError();
  const prompt = `Role: ${params.role}\nCompany: ${params.company}\nLocation: ${params.location}\nExperience: ${params.yearsExperience} yrs\nOffered base: ${params.offeredBase}${params.offeredBonus ? `\nOffered bonus: ${params.offeredBonus}` : ""}${params.offeredEquity ? `\nOffered equity: ${params.offeredEquity}` : ""}${params.targetBase ? `\nTarget base: ${params.targetBase}` : ""}\n\nReturn JSON:\n{"script":"<complete negotiation email>","keyPoints":["<point>"],"counterOffer":{"base":"","bonus":"","equity":""},"marketInsight":"<2-3 sentences>","doList":["<do>"],"dontList":["<dont>"]}`;
  return callJSON<NegotiationResult>(prompt, SYS_NEGOTIATE, 2000);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ATS Match Scoring
// ─────────────────────────────────────────────────────────────────────────────
const SYS_SCORE = `You are an ATS system and senior recruiter. Score how well a resume matches a job description.
Output ONLY valid JSON — no markdown fences, no prose outside the JSON.`;

export interface MatchResult {
  verdict:        string;
  score:          number;
  strengths:      string[];
  gaps:           string[];
  recommendation: string;
}

export async function scoreJobMatch(
  resumeText:     string,
  jobDescription: string
): Promise<MatchResult> {
  if (!isAIEnabled()) return heuristicScore(resumeText, jobDescription);
  const prompt = `JOB DESCRIPTION:\n${jobDescription.slice(0, 3000)}\n\nRESUME:\n${resumeText.slice(0, 4000)}\n\nReturn JSON:\n{"verdict":"Strong Match|Good Match|Partial Match|Weak Match","score":<0-100>,"strengths":["<strength>"],"gaps":["<gap>"],"recommendation":"<1-2 sentences>"}`;
  return callJSON<MatchResult>(prompt, SYS_SCORE, 1000);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Email Job Extractor
// ─────────────────────────────────────────────────────────────────────────────
const SYS_EMAIL = `You are a job-alert email parser. Extract job details from email text.
Output ONLY valid JSON — no markdown fences, no prose outside the JSON.
Use empty strings when information is absent.`;

export interface ExtractedEmail {
  isJobPosting: boolean;
  title:        string;
  company:      string;
  location:     string;
  applyUrl:     string;
  deadline:     string;
  salary:       string;
  keySkills:    string[];
  summary:      string;
}

export async function extractJobFromEmail(emailText: string): Promise<ExtractedEmail> {
  if (!isAIEnabled()) {
    return { isJobPosting: true, title: "", company: "", location: "", applyUrl: "", deadline: "", salary: "", keySkills: [], summary: emailText.slice(0, 300) };
  }
  const prompt = `Parse this email for job details:\n\n${emailText.slice(0, 6000)}\n\nReturn JSON:\n{"isJobPosting":true,"title":"","company":"","location":"","applyUrl":"","deadline":"","salary":"","keySkills":[],"summary":""}`;
  return callJSON<ExtractedEmail>(prompt, SYS_EMAIL, 900);
}

// ─────────────────────────────────────────────────────────────────────────────
// Heuristic fallbacks (no API key needed)
// ─────────────────────────────────────────────────────────────────────────────
const TECH_KW = ["JavaScript","TypeScript","React","Next.js","Node.js","Python","Java","Go","Rust","AWS","Docker","Kubernetes","GraphQL","REST","SQL","MongoDB","Postgres","Redis","Tailwind","CSS","HTML","Git","CI/CD","Agile","Kafka"];

function heuristicParseJob(text: string): ParsedJob {
  const t        = text.replace(/\s+/g, " ").trim();
  const title    = t.match(/(?:position|role|title)[:\-–]\s*([A-Z][\w\s/&]{2,60})/i)?.[1]?.trim() ?? "";
  const company  = t.match(/(?:at|@|company)[:\-–\s]+([A-Z][\w&.\- ]{1,50})/i)?.[1]?.trim()       ?? "";
  const location = t.match(/\b(remote|hybrid|on-?site|[A-Z][a-z]+,\s*[A-Z]{2})\b/i)?.[0]          ?? "";
  const salary   = t.match(/\$\d{2,3}[kK](?:\s*[-–]\s*\$?\d{2,3}[kK])?|\d{1,3}(?:,\d{3})*\s*(?:LPA|lpa)/)?.[0] ?? "";
  const keywords = TECH_KW.filter(k => new RegExp(`\\b${k.replace(/\./g,"\\.")}\\b`, "i").test(t));
  return { title, company, location, salaryRange: salary, requiredSkills: keywords, niceToHaveSkills: [], responsibilities: [], qualifications: [], workMode: /remote/i.test(t) ? "remote" : /hybrid/i.test(t) ? "hybrid" : "unknown", summary: t.slice(0, 300), keywords };
}

function heuristicScore(resume: string, jd: string): MatchResult {
  const r     = resume.toLowerCase();
  const j     = jd.toLowerCase();
  const jdKw  = TECH_KW.filter(k => j.includes(k.toLowerCase()));
  const hits  = jdKw.filter(k => r.includes(k.toLowerCase()));
  const score = Math.round((hits.length / Math.max(jdKw.length, 1)) * 100);
  return {
    verdict:        score >= 70 ? "Strong Match" : score >= 45 ? "Good Match" : score >= 25 ? "Partial Match" : "Weak Match",
    score,
    strengths:      hits.slice(0, 5).map(k => `${k} matches JD requirements`),
    gaps:           [],
    recommendation: "Add ANTHROPIC_API_KEY for detailed AI-powered analysis.",
  };
}
