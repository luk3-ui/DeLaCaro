// Evolution → extraer mensaje nuevo (con anti-duplicado)
const raw = $input.first().json;
const body = raw.body || raw;

const event = String(body.event || '').toLowerCase().replace(/_/g, '.');
if (event === 'messages.set' || event === 'chats.set' || event === 'chats.upsert') {
  return [];
}
if (event && event !== 'messages.upsert') {
  return [];
}

const data = body.data || body;
const upsertType = String(data?.type || 'notify').toLowerCase();
if (upsertType === 'append') {
  return [];
}

const staticData = $getWorkflowStaticData('global');
if (!staticData.seen) staticData.seen = {};
const now = Date.now();
for (const [id, ts] of Object.entries(staticData.seen)) {
  if (now - ts > 5 * 60 * 1000) delete staticData.seen[id];
}

function extractText(msg) {
  if (!msg || typeof msg !== 'object') return '';
  if (msg.conversation) return String(msg.conversation);
  if (msg.extendedTextMessage?.text) return String(msg.extendedTextMessage.text);
  if (msg.imageMessage?.caption) return String(msg.imageMessage.caption);
  if (msg.videoMessage?.caption) return String(msg.videoMessage.caption);
  if (msg.buttonsResponseMessage?.selectedDisplayText) {
    return String(msg.buttonsResponseMessage.selectedDisplayText);
  }
  if (msg.listResponseMessage?.title) return String(msg.listResponseMessage.title);
  if (msg.ephemeralMessage?.message) return extractText(msg.ephemeralMessage.message);
  if (msg.viewOnceMessage?.message) return extractText(msg.viewOnceMessage.message);
  if (msg.documentWithCaptionMessage?.message) {
    return extractText(msg.documentWithCaptionMessage.message);
  }
  return '';
}

function processEntry(entry) {
  if (!entry?.key) return null;
  if (entry.key.fromMe === true) return null;

  const msgId = String(entry.key.id || '');
  if (msgId && staticData.seen[msgId]) return null;
  if (msgId) staticData.seen[msgId] = now;

  const jid = String(entry.key.remoteJid || '');
  if (!jid || jid.endsWith('@g.us') || jid === 'status@broadcast') return null;

  const phone = String(
    entry.key.remoteJidAlt ||
    entry.key.senderPn ||
    entry.key.participant ||
    jid
  )
    .replace('@s.whatsapp.net', '')
    .replace('@c.us', '')
    .split('@')[0]
    .replace(/\D/g, '');

  const text = extractText(entry.message).trim();
  if (phone && text) return { phone, text, messageId: msgId };
  return null;
}

let entries = [];
if (Array.isArray(data)) {
  entries = data;
} else if (Array.isArray(data?.messages)) {
  entries = data.messages;
} else if (data?.key) {
  entries = [data];
}

const out = [];
for (const entry of entries) {
  const row = processEntry(entry);
  if (row) out.push({ json: row });
}

return out;
