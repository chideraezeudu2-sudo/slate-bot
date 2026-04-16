/**
 * Simple logging utility with timestamp and level prefix
 */
function log(level, message) {
  const timestamp = new Date().toISOString();
  const prefix = {
    'info': '✓',
    'warn': '⚠️',
    'error': '✗'
  }[level] || '•';

  console.log(`[${timestamp}] ${prefix} ${message}`);
}

module.exports = { log };
