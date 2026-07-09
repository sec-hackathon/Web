// relief-hub/src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // 명세서의 Base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 로컬 스토리지의 토큰을 모든 요청에 자동으로 삽입
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 응답 인터셉터: 토큰 만료(401) 시 재발급 후 원래 요청 재시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      try {
        const res = await axios.post('/api/auth/reissue', {
          refreshToken,
        });

        const {
          accessToken,
          refreshToken: newRefreshToken,
        } = res.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (reissueError) {
        // 재발급 실패 시 로그아웃 처리
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(reissueError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;