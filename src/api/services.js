import api from './axios';

export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  signin: (data) => api.post('/auth/signin', data),
  logout: () => api.post('/auth/logout'),
  reissue: (refreshToken) => api.post('/auth/reissue', { refreshToken }),
  getMe: () => api.get('/me'),
};

export const dataService = {
  // 6. 지원 프로그램 목록 조회
  getPrograms: (region, type) =>
    api.get('/programs', { params: { region, type } }),

  // 7. 지원 프로그램 상세 조회
  getProgramDetail: (id) => api.get(`/programs/${id}`),

  // 8. 통합 검색 (Home.jsx에서 사용)
  searchAll: (location, needs) =>
    api.post('/search', { location, needs }),

  // 9. 주변 대피소 조회
  getShelters: (lat, lng, radius) =>
    api.get('/shelters', { params: { lat, lng, radius } }),

  // 10. 대피소 상세 조회
  getShelterDetail: (id) => api.get(`/shelters/${id}`),
};