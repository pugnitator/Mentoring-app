import { apiClient } from '../../../shared/api/axios';
import type { RequestListItem, RequestWithContact, CreateRequestBody } from '../../../shared/types/requests';

export const requestsApi = {
  create(data: CreateRequestBody): Promise<RequestListItem> {
    return apiClient.post<RequestListItem>('/requests', data).then((res) => res.data);
  },

  getIncoming(): Promise<RequestListItem[]> {
    return apiClient.get<RequestListItem[]>('/requests/incoming').then((res) => res.data);
  },

  getOutgoing(): Promise<RequestListItem[]> {
    return apiClient.get<RequestListItem[]>('/requests/outgoing').then((res) => res.data);
  },

  accept(requestId: string): Promise<RequestWithContact> {
    return apiClient.patch<RequestWithContact>(`/requests/${requestId}/accept`).then((res) => res.data);
  },

  reject(requestId: string): Promise<RequestListItem> {
    return apiClient.patch<RequestListItem>(`/requests/${requestId}/reject`).then((res) => res.data);
  },
};
