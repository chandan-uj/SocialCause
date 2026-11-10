import assert from 'node:assert/strict';
import { test } from 'node:test';
import request from 'supertest';
import { assertCampaignStatusTransition } from '../src/utils/campaignStatus.js';
import { assertOwner } from '../src/utils/authorization.js';
import { registerVolunteer } from '../src/services/volunteerService.js';

process.env.MONGODB_URI ||= 'mongodb://127.0.0.1:27017/socialcause_test';
process.env.JWT_SECRET ||= 'test-secret-that-is-long-enough-to-pass-validation';
process.env.CLIENT_URL ||= 'http://localhost:5173';
process.env.NODE_ENV = 'test';
const { default: app } = await import('../src/app.js');
const { requireAdmin } = await import('../src/middleware/auth.js');

test('health endpoint reports the API is available without a database query', async () => {
  const response = await request(app).get('/api/v1/health');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.data, { status: 'ok' });
});

test('registration rejects invalid email and weak passwords before database access', async () => {
  const response = await request(app).post('/api/v1/auth/register').send({
    name: 'A', email: 'not-an-email', password: 'short'
  });
  assert.equal(response.status, 400);
  assert.match(response.body.message, /valid email|at least 8 characters/i);
});

test('login rejects malformed credentials before database access', async () => {
  const response = await request(app).post('/api/v1/auth/login').send({ email: 'invalid', password: '' });
  assert.equal(response.status, 400);
});

test('campaign creation requires authentication', async () => {
  const response = await request(app).post('/api/v1/campaigns').send({});
  assert.equal(response.status, 401);
});

test('admin endpoints reject unauthenticated requests', async () => {
  const response = await request(app).get('/api/v1/admin/stats');
  assert.equal(response.status, 401);
});

test('administrator middleware denies normal users and permits admins', () => {
  let denied;
  requireAdmin({ user: { role: 'user' } }, {}, (error) => { denied = error; });
  assert.equal(denied.statusCode, 403);
  let proceeded = false;
  requireAdmin({ user: { role: 'admin' } }, {}, () => { proceeded = true; });
  assert.equal(proceeded, true);
});

test('mutating requests from an untrusted browser origin are rejected', async () => {
  const response = await request(app).post('/api/v1/auth/register')
    .set('Origin', 'https://attacker.example')
    .send({ name: 'Maya Chen', email: 'maya@example.com', password: 'a-valid-password' });
  assert.equal(response.status, 403);
  assert.match(response.body.message, /origin is not allowed/i);
});

test('campaign status transitions permit lifecycle changes and reject reopening terminal campaigns', () => {
  assert.doesNotThrow(() => assertCampaignStatusTransition('draft', 'active'));
  assert.doesNotThrow(() => assertCampaignStatusTransition('active', 'completed'));
  assert.throws(() => assertCampaignStatusTransition('completed', 'active'), /cannot transition/);
  assert.throws(() => assertCampaignStatusTransition('cancelled', 'draft'), /cannot transition/);
});

test('volunteer capacity reservation rejects a full campaign before creating a registration', async () => {
  const campaign = { status: 'active', endDate: new Date(Date.now() + 86400000), volunteerCount: 1, volunteerCapacity: 1 };
  let registrationTouched = false;
  const CampaignModel = {
    findById: async () => campaign,
    findOneAndUpdate: async () => null
  };
  const RegistrationModel = {
    findOneAndUpdate: async () => { registrationTouched = true; },
    create: async () => { registrationTouched = true; }
  };
  await assert.rejects(
    registerVolunteer({ campaignId: 'campaign-id', userId: 'user-id', CampaignModel, RegistrationModel }),
    (error) => error.statusCode === 409 && /full/.test(error.message)
  );
  assert.equal(registrationTouched, false);
});

test('duplicate volunteer registration rolls back the reserved capacity', async () => {
  const campaign = { status: 'active', endDate: new Date(Date.now() + 86400000), volunteerCount: 0, volunteerCapacity: 2 };
  const CampaignModel = {
    findById: async () => campaign,
    findOneAndUpdate: async () => { campaign.volunteerCount += 1; return campaign; },
    updateOne: async (_filter, update) => { campaign.volunteerCount += update.$inc.volunteerCount; }
  };
  const RegistrationModel = {
    findOneAndUpdate: async () => null,
    create: async () => { throw Object.assign(new Error('duplicate'), { code: 11000 }); }
  };
  await assert.rejects(
    registerVolunteer({ campaignId: 'campaign-id', userId: 'user-id', CampaignModel, RegistrationModel }),
    (error) => error.statusCode === 409 && /already joined/.test(error.message)
  );
  assert.equal(campaign.volunteerCount, 0);
});

test('post ownership prevents edits by other users while allowing the owner or admin', () => {
  assert.throws(() => assertOwner('owner-id', { id: 'other-id', role: 'user' }), (error) => error.statusCode === 403);
  assert.doesNotThrow(() => assertOwner('owner-id', { id: 'owner-id', role: 'user' }));
  assert.doesNotThrow(() => assertOwner('owner-id', { id: 'admin-id', role: 'admin' }));
});
