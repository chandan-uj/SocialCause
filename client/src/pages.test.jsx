import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthPage, CampaignsPage } from './pages';

const auth = vi.hoisted(() => ({ login: vi.fn(), register: vi.fn() }));
vi.mock('./context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('./services/api', () => ({ default: { get: vi.fn() } }));
import api from './services/api';

describe('registration form', () => {
  beforeEach(() => { auth.login.mockReset(); auth.register.mockReset(); });

  it('blocks submission when password confirmation does not match', async () => {
    render(<MemoryRouter><AuthPage mode="register" /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Maya Chen' } });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'maya@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'a-secure-password' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'different-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match.');
    expect(auth.register).not.toHaveBeenCalled();
  });
});

describe('campaign exploration controls', () => {
  beforeEach(() => {
    api.get.mockReset();
    api.get.mockImplementation((url) => {
      const page = Number(new URLSearchParams(url.split('?')[1]).get('page'));
      return Promise.resolve({ data: { data: { items: [{ _id: 'sample-campaign', title: 'Community garden', shortDescription: 'Grow together.', category: 'Community development', location: 'Pune', status: 'active', volunteerCount: 1 }], page, pages: 2, total: 10 } } });
    });
  });

  it('moves to the next results page', async () => {
    render(<MemoryRouter initialEntries={['/campaigns']}><CampaignsPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: /next/i }));
    await screen.findByText('Page 2 of 2');
    expect(api.get).toHaveBeenLastCalledWith(expect.stringContaining('page=2'));
  });
});
