import app from './app.js';
import { connectDatabase } from './config/db.js';
import { config } from './config/env.js';

try {
  await connectDatabase();
  app.listen(config.port, () => console.log(`SocialCause API listening on port ${config.port}`));
} catch (error) {
  console.error('Unable to start SocialCause API:', error.message);
  process.exitCode = 1;
}
