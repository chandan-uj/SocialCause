import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from './config/db.js';
import User from './models/User.js';

const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;

if (!email || !password) {
  throw new Error('Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD before bootstrapping an administrator.');
}
if (password.length < 12) {
  throw new Error('ADMIN_BOOTSTRAP_PASSWORD must be at least 12 characters long.');
}

try {
  await connectDatabase();
  if (await User.exists({ email })) {
    throw new Error('An account with ADMIN_BOOTSTRAP_EMAIL already exists. Use an existing administrator to manage roles.');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ name: 'SocialCause Administrator', email, passwordHash, role: 'admin' });
  console.log(`Administrator account created for ${email}.`);
} finally {
  await mongoose.disconnect();
}
