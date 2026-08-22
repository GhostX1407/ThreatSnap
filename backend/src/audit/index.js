const db = require('../db');

// Records a single audit entry: who did what, on which resource, when.
function record(user, action, result) {
  db.saveAuditEntry({
    user,
    action,
    resource_id: result.id,
    timestamp: result.timestamp
  });
}

function getAll() {
  return db.getAuditEntries();
}

module.exports = { record, getAll };
