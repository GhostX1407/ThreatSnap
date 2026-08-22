const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, '../../db.json'));
const db = low(adapter);

// Set defaults if db.json is empty/new
db.defaults({ threats: [], audit: [] }).write();

function saveThreat(result) {
  db.get('threats').push(result).write();
}

function getThreats() {
  return db.get('threats').value();
}

function saveAuditEntry(entry) {
  db.get('audit').push(entry).write();
}

function getAuditEntries() {
  return db.get('audit').value();
}

module.exports = { saveThreat, getThreats, saveAuditEntry, getAuditEntries };
