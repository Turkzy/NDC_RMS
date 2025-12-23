# Production Logging Guide

## Overview
This guide explains how to use the production logging system implemented with Pino.

## Installation

```bash
cd server
npm install pino pino-pretty
```

## Logger Configuration

The logger is configured in `server/utils/logger.js`:

- **Development**: Pretty-printed, colored output
- **Production**: JSON format (structured logging)
- **Sensitive Data**: Automatically redacted (passwords, tokens, etc.)
- **Log Levels**: debug, info, warn, error

## Usage Examples

### Basic Usage

```javascript
import logger from './utils/logger.js';

// Info level
logger.info('Server started successfully');

// Error level
logger.error({ err }, 'Database connection failed');

// Warning level
logger.warn('Rate limit approaching');

// Debug level (only in development)
logger.debug({ userId: 123 }, 'User authenticated');
```

### In Controllers

```javascript
import logger, { createLogger } from './utils/logger.js';

// Create module-specific logger
const userLogger = createLogger('UserController');

export const createAccount = async (req, res) => {
  try {
    // ... your code ...
    userLogger.info({ userId: newUser.id }, 'User account created');
    return res.status(201).json({ success: true });
  } catch (error) {
    // Log error with context
    userLogger.error({ err: error, email: req.body.email }, 'Create account failed');
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
```

### Log Levels

1. **error**: Critical errors that need immediate attention
   ```javascript
   logger.error({ err }, 'Failed to connect to database');
   ```

2. **warn**: Warnings that should be investigated
   ```javascript
   logger.warn({ userId: 123 }, 'Multiple failed login attempts');
   ```

3. **info**: General informational messages
   ```javascript
   logger.info({ port: 5002 }, 'Server started');
   ```

4. **debug**: Detailed debugging information (development only)
   ```javascript
   logger.debug({ query }, 'Database query executed');
   ```

## Best Practices

### ✅ DO:
- Use appropriate log levels
- Include context in logs (user ID, request ID, etc.)
- Log errors with error objects: `logger.error({ err }, 'message')`
- Use structured logging (objects, not strings)
- Redact sensitive data (automatically handled)

### ❌ DON'T:
- Don't log passwords, tokens, or sensitive user data
- Don't use console.log/error in production
- Don't log entire request objects (too verbose)
- Don't log in tight loops (performance impact)

## Environment Variables

Add to your `.env` file:

```env
# Log level: debug, info, warn, error
LOG_LEVEL=info

# Environment: development, production
NODE_ENV=production
```

## Production Output Example

```json
{
  "level": "INFO",
  "time": "2025-01-15T10:30:45.123Z",
  "module": "UserController",
  "userId": 123,
  "msg": "User account created"
}
```

## Migration Guide

### Before (console.error):
```javascript
catch (error) {
  console.error("Create account error:", error);
  return res.status(500).json({ error: true });
}
```

### After (logger):
```javascript
catch (error) {
  logger.error({ err: error }, "Create account error");
  return res.status(500).json({ error: true });
}
```

## Log Aggregation (Production)

For production, consider:
- **File logging**: Write logs to files
- **Log rotation**: Use `pino-roll` or similar
- **Log aggregation**: Send to services like:
  - Datadog
  - Loggly
  - ELK Stack (Elasticsearch, Logstash, Kibana)
  - CloudWatch (AWS)

## Example: File Logging

```javascript
import pino from 'pino';
import fs from 'fs';

const logStream = fs.createWriteStream('./logs/app.log', { flags: 'a' });

const logger = pino({
  level: 'info',
}, logStream);
```

