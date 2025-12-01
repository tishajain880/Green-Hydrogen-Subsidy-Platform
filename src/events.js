const EventEmitter = require("events");

// Singleton emitter for server-sent events
class SSEEmitter extends EventEmitter {}

const emitter = new SSEEmitter();
module.exports = emitter;
