import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from './config/db.js';
import User from './models/User.js';
import Campaign from './models/Campaign.js';
import Post from './models/Post.js';

if (process.env.NODE_ENV !== 'development') {
  throw new Error('The sample seed script only runs when NODE_ENV=development.');
}
const password = process.env.SEED_PASSWORD;
if (!password || password.length < 12) {
  throw new Error('Set a SEED_PASSWORD of at least 12 characters for development sample accounts.');
}

const seedUsers = [
  { name: 'Maya Chen', email: 'maya@socialcause.local', location: 'Pune' },
  { name: 'Arjun Rao', email: 'arjun@socialcause.local', location: 'Bengaluru' },
  { name: 'Leela Nair', email: 'leela@socialcause.local', location: 'Kochi' }
];
const campaignSeeds = [
  ['community-garden-neighborhood', 'Grow a Neighborhood Community Garden', 'Turn an unused neighborhood plot into a shared garden for fresh food and connection.', 'Community development', 'Pune', 'photo-1416879595882-3373a0480b5b'],
  ['digital-learning-rural-classrooms', 'Digital Learning for Rural Classrooms', 'Help students build confidence with practical digital skills and accessible learning tools.', 'Education and digital literacy', 'Bengaluru', 'photo-1509062522246-3755977927d7'],
  ['restore-local-wetlands', 'Restore Our Local Wetlands', 'Bring volunteers together to remove waste and restore native plants around a local wetland.', 'Environmental protection', 'Kochi', 'photo-1437482078695-73f5ca6c96e2'],
  ['farmers-market-access', 'A Better Market for Small Farmers', 'Connect small farmers with local buyers and support fair, resilient food systems.', 'Agriculture and farmer welfare', 'Pune', 'photo-1500382017468-9049fed747ef'],
  ['community-meal-network', 'Build a Community Meal Network', 'Prepare and share nutritious meals with neighbors facing food insecurity.', 'Poverty alleviation', 'Bengaluru', 'photo-1532629345422-7515f3d16bb6'],
  ['healthy-hearts-awareness', 'Healthy Hearts, Healthier Communities', 'Host neighborhood conversations about preventive care and heart health.', 'Healthcare awareness', 'Kochi', 'photo-1576091160399-112ba8d25d1d'],
  ['shelter-animal-care', 'Weekend Care for Shelter Animals', 'Help a local animal shelter with enrichment, socialization, and essential supplies.', 'Animal welfare', 'Pune', 'photo-1450778869180-41d0601e046e'],
  ['women-skills-circle', 'Women’s Skills and Support Circle', 'Create a welcoming space for women to share skills, build networks, and mentor one another.', 'Women empowerment', 'Bengaluru', 'photo-1573496359142-b8d87734a5a2']
];

try {
  await connectDatabase();
  const passwordHash = await bcrypt.hash(password, 12);
  const users = {};
  for (const details of seedUsers) {
    let user = await User.findOne({ email: details.email });
    if (!user) user = await User.create({ ...details, passwordHash });
    users[details.email] = user;
  }
  for (let index = 0; index < campaignSeeds.length; index += 1) {
    const [slug, title, shortDescription, category, location, imageId] = campaignSeeds[index];
    if (await Campaign.exists({ slug })) continue;
    const organizer = users[seedUsers[index % seedUsers.length].email];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + index + 2);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 35);
    await Campaign.create({
      slug, title, shortDescription,
      description: `${shortDescription}\n\nJoin local volunteers for practical, welcoming activities. No previous experience is required—bring your curiosity, a little time, and a willingness to work together.`,
      category, location, organizer: organizer.id, startDate, endDate, volunteerCapacity: 40 + index * 5,
      goals: ['Bring neighbors together around a shared local need', 'Create practical, lasting community benefit'],
      image: `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=1200&q=80`, status: 'active'
    });
  }
  for (const [index, category] of ['Environmental protection', 'Education and digital literacy', 'Community development'].entries()) {
    const author = users[seedUsers[index].email];
    const title = ['A small step toward greener streets', 'Learning grows when we share', 'Neighbors make resilient communities'][index];
    if (!await Post.exists({ title, author: author.id })) {
      await Post.create({
        author: author.id, title, category, moderationStatus: 'approved',
        content: [
          'A few neighbors got together this weekend to care for the trees and shared spaces on our street. Small, regular acts of care can make a place feel like home.',
          'A patient mentor, a shared device, and a welcoming learning space can open new doors. Let’s make digital learning accessible to every student.',
          'The best community solutions start by listening. Make space for every voice, share what you know, and build trust one conversation at a time.'
        ][index]
      });
    }
  }
  console.log('Development sample data added. Existing records were left unchanged.');
  console.log('Sample accounts: maya@socialcause.local, arjun@socialcause.local, leela@socialcause.local');
  console.log('All sample accounts use the SEED_PASSWORD value supplied to this command.');
} finally {
  await mongoose.disconnect();
}
