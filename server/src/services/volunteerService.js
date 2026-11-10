import Campaign from '../models/Campaign.js';
import VolunteerRegistration from '../models/VolunteerRegistration.js';
import { HttpError } from '../utils/httpError.js';

export async function registerVolunteer({
  campaignId,
  userId,
  CampaignModel = Campaign,
  RegistrationModel = VolunteerRegistration,
  now = new Date()
}) {
  const campaign = await CampaignModel.findById(campaignId);
  if (!campaign) throw new HttpError(404, 'Campaign not found.');
  if (campaign.status !== 'active') throw new HttpError(400, 'This campaign is not accepting volunteers.');
  if (campaign.endDate < now) throw new HttpError(400, 'This campaign has ended.');

  const reserved = await CampaignModel.findOneAndUpdate(
    { _id: campaignId, status: 'active', $expr: { $lt: ['$volunteerCount', '$volunteerCapacity'] } },
    { $inc: { volunteerCount: 1 } },
    { new: true }
  );
  if (!reserved) throw new HttpError(409, 'This campaign is full or no longer accepting volunteers.');

  try {
    const registration = await RegistrationModel.findOneAndUpdate(
      { user: userId, campaign: campaignId, status: 'cancelled' },
      { $set: { status: 'registered' } },
      { new: true }
    );
    if (registration) return { registration, created: false };
    return {
      registration: await RegistrationModel.create({ user: userId, campaign: campaignId }),
      created: true
    };
  } catch (error) {
    await CampaignModel.updateOne({ _id: campaignId }, { $inc: { volunteerCount: -1 } });
    if (error.code === 11000) throw new HttpError(409, 'You have already joined this campaign.');
    throw error;
  }
}
