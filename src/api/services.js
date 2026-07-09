import axios from 'axios';
import api from './axios'; // 기존 백엔드 API 인스턴스

// ⚠️ 사용 중이신 공공데이터 인증키
const PUBLIC_API_KEY = 'd28378879f996cc2c162094f86dbb1c12646c7083e7d879c80e6c770dcd0f84d';

const getFirstValue = (item, candidates) => {
  for (const key of candidates) {
    const value = item[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }

  const normalizedCandidates = candidates.map((key) => key.replace(/\s|\(|\)|_/g, '').toLowerCase());
  const matchedKey = Object.keys(item).find((key) =>
    normalizedCandidates.some((candidate) =>
      key.replace(/\s|\(|\)|_/g, '').toLowerCase().includes(candidate)
    )
  );

  return matchedKey ? item[matchedKey] : undefined;
};

const toNumber = (value) => {
  if (value === undefined || value === null) return null;
  const number = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(number) ? number : null;
};

const getCoordinates = (item) => {
  const lat = toNumber(getFirstValue(item, [
    '위도',
    '위도(WGS84)',
    'WGS84위도',
    'latitude',
    'lat',
    'Y좌표',
    'Y',
  ]));
  const lng = toNumber(getFirstValue(item, [
    '경도',
    '경도(WGS84)',
    'WGS84경도',
    'longitude',
    'lng',
    'lon',
    'X좌표',
    'X',
  ]));

  const isKoreaLat = lat !== null && lat >= 33 && lat <= 39;
  const isKoreaLng = lng !== null && lng >= 124 && lng <= 132;

  return {
    lat: isKoreaLat ? lat : null,
    lng: isKoreaLng ? lng : null,
  };
};

const getAddress = (item) =>
  getFirstValue(item, [
    'address',
    '도로명주소',
    '소재지도로명주소',
    '지번주소',
    '소재지지번주소',
    '주소',
    '상세주소',
    '지역',
  ]) || '주소 정보 없음';

const normalizeText = (value) =>
  String(value || '')
    .replace(/특별시|광역시|특별자치시|특별자치도|자치도|시|군|구/g, '')
    .replace(/\s/g, '')
    .toLowerCase();

const getLocationTokens = (location) =>
  String(location || '')
    .trim()
    .split(/\s+/)
    .map(normalizeText)
    .filter(Boolean);

const matchesLocation = (address, location) => {
  const normalizedAddress = normalizeText(address);
  const tokens = getLocationTokens(location);

  if (tokens.length === 0) return true;
  return tokens.some((token) => normalizedAddress.includes(token));
};

const normalizeShelter = (item, idx) => {
  const capacity = Number(getFirstValue(item, [
    'capacity',
    '수용가능인원수',
    '최대수용인원수',
    '수용인원',
    '수용가능인원',
  ]) || 100);
  const { lat, lng } = getCoordinates(item);
  const address = getAddress(item);
  const region = getFirstValue(item, ['지역', 'region']) || address;
  const facilityType = getFirstValue(item, ['시설구분', 'type']) || '대피소';
  const aggregateCount = Number(getFirstValue(item, ['개소', 'count', 'facilityCount']) || 1);

  return {
    id: getFirstValue(item, ['id', '시설번호', '임시주거시설관리번호', '관리번호']) || `shelter-${idx}`,
    name: getFirstValue(item, ['name', '시설명', '임시주거시설명', '대피소명', '장소명']) || `${region} ${facilityType}`,
    address,
    contact: getFirstValue(item, ['contact', '전화번호', '관리기관전화번호', '담당자연락처']) || '02-120',
    capacity,
    current_occupancy: Number(item.current_occupancy || item.currentOccupancy || 0),
    facilities: Array.isArray(item.facilities)
      ? item.facilities
      : ['식수', '급식소', '난방장치', '의료실'].slice(0, Math.floor(Math.random() * 3) + 2),
    lat,
    lng,
    aggregateCount,
    area: getFirstValue(item, ['면적(제곱미터)', 'area']),
    dataDate: getFirstValue(item, ['자료시점', 'updatedAt']),
    isAggregate: aggregateCount > 1 || Boolean(item.지역),
    raw: item,
  };
};

const normalizeSearchResponse = (payload, location) => {
  const sourceShelters = payload?.shelters || payload?.data?.shelters || payload?.data || [];
  const sourcePrograms = payload?.programs || payload?.data?.programs || [];
  const shelterList = Array.isArray(sourceShelters) ? sourceShelters : [];

  return {
    shelters: shelterList
      .filter((item) => {
        const address = getAddress(item);

        return matchesLocation(address, location);
      })
      .map(normalizeShelter),
    programs: Array.isArray(sourcePrograms) ? sourcePrograms : [],
  };
};

const PUBLIC_SHELTER_URL =
  `https://api.odcloud.kr/api/15124965/v1/uddi:78c724b6-8ee3-4998-946b-802f1f091336?serviceKey=${PUBLIC_API_KEY}`;

const fetchPublicShelters = async (location = '', { maxPages = 6, perPage = 1000 } = {}) => {
  const firstRes = await axios.get(PUBLIC_SHELTER_URL, {
    params: {
      page: 1,
      perPage,
    },
  });

  const totalCount = Number(firstRes.data?.totalCount || firstRes.data?.total_count || 0);
  const firstData = firstRes.data?.data || [];
  const pageCount = totalCount > 0
    ? Math.min(maxPages, Math.ceil(totalCount / perPage))
    : 1;

  const restResponses = await Promise.all(
    Array.from({ length: Math.max(pageCount - 1, 0) }, (_, idx) =>
      axios.get(PUBLIC_SHELTER_URL, {
        params: {
          page: idx + 2,
          perPage,
        },
      })
    )
  );

  const rawShelters = [
    ...firstData,
    ...restResponses.flatMap((res) => res.data?.data || []),
  ];

  const filteredShelters = rawShelters.filter((item) => {
    const address = getAddress(item);

    return matchesLocation(address, location);
  });

  return filteredShelters.map(normalizeShelter).slice(0, 250);
};

const getDefaultPrograms = (location) => [
  {
    id: 'p1',
    type: '금전',
    region: location,
    title: `${location || '전국'} 이재민 긴급생계비 지원 사업`,
    eligibility: `재난 피해 가구 중 ${location || '해당 지역'} 내에 거주 중인 소득 기준 충족자`,
    deadline: '상시 접수',
    contact: '02-120',
    link: `https://www.safekorea.go.kr/idsiSFK/neo/main/main.html`
  },
  {
    id: 'p2',
    type: '의료',
    region: location || '전국',
    title: `${location || '전국'} 재난 피해자 외상 후 스트레스(PTSD) 무료 상담`,
    eligibility: '재난을 겪은 해당 지역 관내 모든 주민',
    deadline: '상시 운영',
    contact: '1577-0199',
    link: 'https://www.nct.go.kr/'
  }
];

// 1. 회원가입/로그인 등 인증 관련 서비스 (누락되었던 부분 복구!)
export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  signin: (data) => api.post('/auth/signin', data),
  logout: () => api.post('/auth/logout'),
  reissue: (refreshToken) => api.post('/auth/reissue', { refreshToken }),
  getMe: () => api.get('/me'),
};

// 2. 대피소 및 프로그램 데이터 관련 서비스
export const dataService = {
  // 6. 지원 프로그램 목록 조회
  getPrograms: (region, type) =>
      api.get('/programs', { params: { region, type } }),

  // 7. 지원 프로그램 상세 조회
  getProgramDetail: (id) => api.get(`/programs/${id}`),

  // 8. 통합 검색 (공공 API 연동 및 데이터 필터링/가공)
  searchAll: async (location, _needs) => {
    try {
      const publicShelters = await fetchPublicShelters(location);

      if (publicShelters.length > 0) {
        return {
          data: {
            shelters: publicShelters,
            programs: getDefaultPrograms(location),
          },
        };
      }

      try {
        const backendRes = await api.post('/search', { location, needs: _needs });
        const normalized = normalizeSearchResponse(backendRes.data, location);

        if (normalized.shelters.length > 0) {
          return {
            data: {
              shelters: normalized.shelters,
              programs: normalized.programs,
            },
          };
        }
      } catch (backendError) {
        console.warn('백엔드 검색 실패, 공공 API 직접 호출로 전환:', backendError);
      }

      return {
        data: {
          shelters: [],
          programs: getDefaultPrograms(location),
        },
      };
    } catch (error) {
      console.error('공공 API 호출 에러 상세:', error);
      throw error;
    }
  },

  // 9. 주변 대피소 조회
  getShelters: (lat, lng, radius) =>
      api.get('/shelters', { params: { lat, lng, radius } }),

  getPublicShelters: async (location = '서울') => ({
    data: {
      shelters: await fetchPublicShelters(location),
      programs: getDefaultPrograms(location),
    },
  }),

  // 10. 대피소 상세 조회
  getShelterDetail: (id) => api.get(`/shelters/${id}`),
};
