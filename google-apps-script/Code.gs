/**
 * Attendance Registrar -> Google Sheets endpoint.
 *
 * Setup:
 *  1. Create a Google Sheet. Note its tab name (default "Attendance").
 *  2. Extensions -> Apps Script. Paste this file in.
 *  3. (Optional) Set SHARED_SECRET below and copy the same value into your
 *     Nuxt .env as NUXT_GOOGLE_SCRIPT_SECRET.
 *  4. Deploy -> New deployment -> type "Web app".
 *       - Execute as: Me
 *       - Who has access: Anyone
 *  5. Copy the Web app URL into your Nuxt .env as NUXT_GOOGLE_SCRIPT_URL.
 */

var SHEET_NAME = 'Attendance';
var SHARED_SECRET = ''; // leave '' to disable the check

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (SHARED_SECRET && data.secret !== SHARED_SECRET) {
      return json({ ok: false, error: 'Unauthorized' });
    }

    var records = data.records || [];
    if (!records.length) {
      return json({ ok: false, error: 'No records' });
    }

    var sheet = getSheet();
    var takenAt = data.takenAt || new Date().toISOString();

    records.forEach(function (r) {
      sheet.appendRow([
        takenAt,
        r.name || '',
        r.phone || '',
        r.email || '',
        r.location || '',
        r.status || ''
      ]);
    });

    return json({ ok: true, saved: records.length });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Taken At', 'Name', 'Phone', 'Email', 'Location', 'Status']);
  }
  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
