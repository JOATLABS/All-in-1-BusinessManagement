import { apiFetch } from './apiClient';
import type { SiteContent } from '../types/content';

export interface SiteContentResponse {
  hero: SiteContent['hero'];
  event: Omit<SiteContent['event'], 'start' | 'end'> & { start: string; end: string };
  footer: SiteContent['footer'];
  reservation: SiteContent['reservation'];
  overlays: SiteContent['overlays'];
}

export const fetchSiteContent = async (): Promise<SiteContentResponse> =>
  apiFetch<SiteContentResponse>('/api/v1/site-content');

export const updateSiteContent = async (
  token: string,
  payload: SiteContentResponse
): Promise<void> => {
  await apiFetch<void, SiteContentResponse>('/api/v1/site-content', {
    method: 'PUT',
    token,
    body: payload
  });
};
