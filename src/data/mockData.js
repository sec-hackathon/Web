// relief-hub/src/data/mockData.js
export const mockShelters = [
  {
    id: 1,
    name: "용산구민체육센터 대피소",
    address: "서울특별시 용산구 독서당로 63",
    lat: 37.5326,
    lng: 127.0016,
    capacity: 500,
    current_occupancy: 120,
    facilities: ["식수", "전기", "의료", "난방"],
    contact: "02-790-7330"
  },
  {
    id: 2,
    name: "한남동 주민센터",
    address: "서울특별시 용산구 대사관로 5길 1",
    lat: 37.5342,
    lng: 127.0025,
    capacity: 200,
    current_occupancy: 185,
    facilities: ["식수", "전기", "상담"],
    contact: "02-2199-8580"
  }
];

export const mockPrograms = [
  {
    id: 1,
    title: "긴급 생활 안정 자금 지원",
    type: "금전",
    eligibility: "재난 지역 거주 이재민 가구 (중위소득 80% 이하)",
    region: "서울시 전체",
    deadline: "2025-12-31",
    link: "https://www.safetydata.go.kr",
    contact: "1588-0000"
  },
  {
    id: 2,
    title: "심리 회복 지원 프로그램",
    type: "상담",
    eligibility: "재난 경험 누구나 무료 참여 가능",
    region: "전국",
    deadline: "상시 모집",
    link: "#",
    contact: "1577-0199"
  }
];