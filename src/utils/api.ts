import type {
  Fleet,
  User,
  Application,
  ApplicationCreateInput,
  RadarSubscription,
  RadarSubscriptionCreateInput,
  FleetMatch,
  FleetCreateInput,
  HostFleetApplications,
} from '../../shared';

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json() as ApiResponse<T>;
  if (!result.success) {
    throw new Error(result.error || 'Request failed');
  }
  return result.data;
}

export const fleetApi = {
  getFleets: (params?: {
    city?: string;
    district?: string;
    type?: string;
    startTime?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.city) searchParams.append('city', params.city);
    if (params?.district) searchParams.append('district', params.district);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.startTime) searchParams.append('startTime', params.startTime);
    
    const query = searchParams.toString();
    return request<Fleet[]>(`/fleets${query ? `?${query}` : ''}`);
  },

  getFleet: (id: string) => request<Fleet>(`/fleets/${id}`),

  createFleet: (data: FleetCreateInput) =>
    request<Fleet>('/fleets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const userApi = {
  getUser: (id: string) => request<User>(`/users/${id}`),
};

export const applicationApi = {
  createApplication: (fleetId: string, data: ApplicationCreateInput) =>
    request<Application>(`/fleets/${fleetId}/applications`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getApplications: (fleetId: string) =>
    request<Application[]>(`/fleets/${fleetId}/applications`),

  updateStatus: (id: string, status: Application['status']) =>
    request<Application>(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  markViewed: (id: string) =>
    request<Application>(`/applications/${id}/view`, {
      method: 'PUT',
    }),

  getHostApplications: (hostId: string) =>
    request<HostFleetApplications[]>(`/applications/host/${hostId}`),
};

export const radarApi = {
  getSubscriptions: () => request<RadarSubscription[]>('/radar/subscriptions'),

  createSubscription: (data: RadarSubscriptionCreateInput) =>
    request<RadarSubscription>('/radar/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteSubscription: (id: string) =>
    request<{ success: boolean }>(`/radar/subscriptions/${id}`, {
      method: 'DELETE',
    }),

  getMatches: (params?: { scriptName?: string; city?: string; unreadOnly?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.scriptName) searchParams.append('scriptName', params.scriptName);
    if (params?.city) searchParams.append('city', params.city);
    if (params?.unreadOnly) searchParams.append('unreadOnly', '1');
    const query = searchParams.toString();
    return request<FleetMatch[]>(`/radar/matches${query ? `?${query}` : ''}`);
  },

  markMatchRead: (id: string) =>
    request<{ success: boolean }>(`/radar/matches/${id}/read`, {
      method: 'PUT',
    }),
};
