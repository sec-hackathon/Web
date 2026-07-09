import React, { useState } from 'react';
import { dataService } from '../api/services';
import { useAuth } from '../context/AuthContext';

const Home = ({ onSearch }) => {
  const { user, logout } = useAuth();
  const [location, setLocation] = useState('');
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [loading, setLoading] = useState(false);

  const needsOptions = [
    { id: '숙소', label: '대피소/숙소' },
    { id: '식량', label: '물품/식량' },
    { id: '의료', label: '의료지원' },
    { id: '상담', label: '심리상담' },
    { id: '금전', label: '지원금' },
  ];

  const handleSearch = async () => {
    if (!location) return alert('지역을 입력해주세요.');
    setLoading(true);
    try {
      // 명세서 8번: 통합 검색 호출
      const res = await dataService.searchAll(location, selectedNeeds);
      onSearch(location, res.data); // 결과 데이터를 MapResults로 전달
    } catch (e) {
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-b from-blue-50 to-white">
      {/* 헤더 섹션 */}
      <div className="absolute top-6 right-6 flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm font-bold text-gray-700">{user.username}님 환영합니다</span>
            <button onClick={logout} className="text-xs bg-gray-200 px-3 py-1.5 rounded-lg">로그아웃</button>
          </>
        ) : (
          <span className="text-sm text-gray-400 font-medium italic">로그인이 필요합니다</span>
        )}
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          도움의 손길이 <span className="text-blue-600">가장 가까운 곳</span>에 있습니다
        </h1>
      </div>

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2 font-sans">현재 위치</label>
          <input 
            type="text" placeholder="예: 서울 용산구"
            className="w-full px-5 py-4 rounded-xl border focus:border-blue-500 outline-none text-lg"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-3 font-sans">필요한 지원 항목</label>
          <div className="flex flex-wrap gap-2">
            {needsOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setSelectedNeeds(prev => prev.includes(option.id) ? prev.filter(i => i !== option.id) : [...prev, option.id])}
                className={`py-2 px-5 rounded-full border text-sm font-medium transition-all ${
                  selectedNeeds.includes(option.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-blue-700 transition-all"
        >
          {loading ? '검색 중...' : '지원 정보 조회하기'}
        </button>
      </div>
    </div>
  );
};

export default Home;