import { HttpError } from './httpError.js';

export function assertOwner(ownerId, user, message = 'You cannot modify this resource.') {
  const userId = user.id || user._id;
  if (user.role !== 'admin' && String(ownerId) !== String(userId)) throw new HttpError(403, message);
}
