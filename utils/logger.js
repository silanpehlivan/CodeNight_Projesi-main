const fs = require('fs');
const path = require('path');

// Logs dizinini oluştur
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'app.log');

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

function formatLog(level, message, data = null) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    logMessage += ` | ${JSON.stringify(data)}`;
  }
  
  return logMessage;
}

function writeLog(level, message, data = null) {
  const logMessage = formatLog(level, message, data);
  
  // Console'a yaz
  console.log(logMessage);
  
  // Dosyaya yaz
  fs.appendFileSync(logFile, logMessage + '\n', 'utf8');
}

const logger = {
  error: (message, data) => writeLog(LOG_LEVELS.ERROR, message, data),
  warn: (message, data) => writeLog(LOG_LEVELS.WARN, message, data),
  info: (message, data) => writeLog(LOG_LEVELS.INFO, message, data),
  debug: (message, data) => writeLog(LOG_LEVELS.DEBUG, message, data),
  
  // Özel logging fonksiyonları
  logTicketCreation: (ticketId, userId, title) => {
    logger.info('Ticket Created', { ticketId, userId, title });
  },
  
  logAICall: (type, success, details) => {
    logger.info('AI API Call', { type, success, details });
  },
  
  logNotificationSent: (ticketId, method, success, details) => {
    logger.info('Notification Sent', { ticketId, method, success, details });
  },
  
  logTicketStatusChange: (ticketId, oldStatus, newStatus, userId) => {
    logger.info('Ticket Status Changed', { ticketId, oldStatus, newStatus, userId });
  }
};

module.exports = logger;
