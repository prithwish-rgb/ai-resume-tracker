// src/lib/gmail.ts (ESM + on-demand)
import fs from "fs/promises";
import path from "path";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import * as cheerio from "cheerio";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

async function loadSavedCredentialsIfExist(): Promise<any | null> {
  try {
    const content = await fs.readFile(TOKEN_PATH, { encoding: "utf-8" });
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function saveCredentials(client: any) {
  const content = await fs.readFile(CREDENTIALS_PATH, { encoding: "utf-8" });
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client?.credentials?.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

export async function getGmailClient() {
  let credentials = await loadSavedCredentialsIfExist();
  if (!credentials) {
    const client = await authenticate({ scopes: SCOPES, keyfilePath: CREDENTIALS_PATH });
    if (client.credentials) await saveCredentials(client);
    credentials = client;
  }
  return google.gmail({ version: "v1", auth: credentials as any });
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

// Note: no top-level execution. Import and call listRecentMessages() from an API route or script.
