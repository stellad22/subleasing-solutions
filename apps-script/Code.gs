/**
 * Subleasing Solutions — saves "Request to sublease" submissions to this Google Sheet.
 *
 * Setup (once, ~5 minutes):
 *  1. Create a Google Sheet (e.g. "Subleasing Solutions – Requests") and share it with your team.
 *  2. In the sheet: Extensions → Apps Script. Delete the sample code and paste this whole file.
 *  3. (Optional) Put your team inbox in NOTIFY_EMAIL to get an email for every new request.
 *  4. Click Deploy → New deployment → type "Web app".
 *       Execute as: Me
 *       Who has access: Anyone
 *     Click Deploy, approve the permissions, and copy the Web app URL (ends in /exec).
 *  5. Paste that URL into VITE_REQUESTS_ENDPOINT in your hosting settings and redeploy the site.
 *
 * If you edit this script later: Deploy → Manage deployments → ✏️ → Version: "New version" → Deploy
 * (the URL stays the same).
 */

const SHEET_NAME = 'Requests';
const NOTIFY_EMAIL = ''; // e.g. 'subleasingsolutions@gmail.com' — leave blank to disable

const HEADERS = [
  'Submitted at', 'Status', 'Listing ID', 'Listing title', 'Email', 'Name',
  'Move in', 'Move out', 'Note', 'Page URL',
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Bots fill the hidden "website" field — silently ignore them.
    if (data.website) return json({ ok: true });

    const email = String(data.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'invalid email' });

    lock.waitLock(10000);
    const sheet = getSheet();
    sheet.appendRow([
      new Date(),
      'New',
      clean(data.listingId, 100),
      clean(data.listingTitle, 200),
      clean(email, 200),
      clean(data.name, 120),
      clean(data.moveIn, 20),
      clean(data.moveOut, 20),
      clean(data.note, 1000),
      clean(data.pageUrl, 300),
    ]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(
        NOTIFY_EMAIL,
        'New sublease request: ' + clean(data.listingTitle, 200),
        [
          'Listing: ' + data.listingTitle + ' (' + data.listingId + ')',
          'Email: ' + email,
          'Name: ' + (data.name || '—'),
          'Dates: ' + (data.moveIn || '?') + ' → ' + (data.moveOut || '?'),
          'Note: ' + (data.note || '—'),
          '',
          'Sheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
        ].join('\n')
      );
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/** Visiting the /exec URL in a browser should show this — handy to confirm the deployment works. */
function doGet() {
  return json({ ok: true, message: 'Subleasing Solutions request endpoint is running.' });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

/** Trim, cap length, and stop spreadsheet formula injection (values starting with = + - @). */
function clean(value, max) {
  let s = String(value == null ? '' : value).trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
