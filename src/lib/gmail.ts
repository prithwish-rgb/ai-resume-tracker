// src/lib/gmail.ts (serverless-safe OAuth flow)
import { google } from "googleapis";
import * as cheerio from "cheerio";

function buildOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Gmail import is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN."
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

export async function getGmailClient() {
  return google.gmail({ version: "v1", auth: buildOAuthClient() });
}

function decodeBase64Url(data?: string): string | null {
  if (!data) return null;
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  const buf = Buffer.from(normalized, "base64");
  return buf.toString("utf-8");
}

function findPart(parts: any[] | undefined, mime: string): any | undefined {
  if (!parts) return undefined;
  for (const p of parts) {
    if (p.mimeType === mime && p.body?.data) return p;
    const nested = findPart(p.parts, mime);
    if (nested) return nested;
  }
  return undefined;
}

export async function listRecentMessages(limit = 5) {
  const gmail = await getGmailClient();
  const res = await gmail.users.messages.list({ userId: "me", maxResults: limit });
  const messages = res.data.messages || [];
  const results: Array<{ id: string; snippet: string; text: string }> = [];

  for (const msg of messages) {
    if (!msg.id) continue;
    const detail = await gmail.users.messages.get({ userId: "me", id: msg.id });
    const payload: any = (detail as any).data?.payload;
    const snippet: string = (detail as any).data?.snippet || "";

    let text = "";
    const htmlPart = findPart(payload?.parts, "text/html");
    const plainPart = findPart(payload?.parts, "text/plain");
    const html = decodeBase64Url(htmlPart?.body?.data) || "";
    if (html) {
      const $ = cheerio.load(html);
      text = $("body").text().replace(/\s+/g, " ").trim();
    } else {
      text = decodeBase64Url(plainPart?.body?.data) || snippet;
    }

    results.push({ id: msg.id, snippet, text });
  }

  return results;
}

// Note: no top-level execution. Import and call listRecentMessages() from an API route.
