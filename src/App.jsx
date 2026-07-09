import React, { useEffect, useState } from 'react';
import Home from './pages/Home';
import MapResults from './pages/MapResults';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuth } from './context/useAuth';
// 1. 최상단으로 올바르게 이동된 import 구문
import { dataService } from './api/services';
import { mockPrograms, mockShelters } from './data/mockData';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState('map');
  const [isSigningUp, setIsSigningUp] = useState(false);

  // 2. 검색 결과 데이터를 저장할 상태(State) 선언
  const [shelters, setShelters] = useState(mockShelters);
  const [programs, setPrograms] = useState(mockPrograms);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;

    const loadInitialShelters = async () => {
      try {
        setSearchLoading(true);
        setSearchLocation('서울');
        const response = await dataService.getPublicShelters('서울');

        if (!cancelled && response?.data) {
          setShelters(response.data.shelters || mockShelters);
          setPrograms(response.data.programs || mockPrograms);
        }
      } catch (error) {
        console.error('초기 대피소 로드 실패:', error);
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    };

    loadInitialShelters();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  if (authLoading) return null;

  // 로그인이 안 되어 있으면 로그인/회원가입 화면 처리
  if (!user) {
    return isSigningUp
        ? <Signup onSwitchToLogin={() => setIsSigningUp(false)} />
        : <Login onSwitchToSignup={() => setIsSigningUp(true)} />;
  }

  // 3. 통합 검색 핸들러 함수
  const handleSearch = async (location, needs) => {
    try {
      setSearchLoading(true);
      setSearchLocation(location); // 검색한 지역 저장

      // 공공 API 및 지원 프로그램 검색 호출
      const response = await dataService.searchAll(location, needs);

      if (response && response.data) {
        setShelters(response.data.shelters || []);
        setPrograms(response.data.programs || []); // 더미 지원 프로그램 데이터 저장 완료!

        // 검색 완료 후 화면을 결과(지도) 페이지로 변경
        setView('map');
      }
    } catch (error) {
      console.error("검색 실패:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-white">
        {view === 'home' ? (
            <Home onSearch={handleSearch} loading={searchLoading} />
        ) : (
            <MapResults
                shelters={shelters}
                programs={programs}
                location={searchLocation}
                onGoBack={() => setView('home')}
            />
        )}
      </div>
  );
}

export default App;
