import { HttpError } from './httpError.js';

const transitions = {
  draft: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

export function assertCampaignStatusTransition(current, next) {
  if (current !== next && !transitions[current]?.includes(next)) {
    throw new HttpError(400, `A ${current} campaign cannot transition to ${next}.`);
  }
}
