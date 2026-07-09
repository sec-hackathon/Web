import React, { useEffect, useState } from 'react';
import ShelterCard from '../components/ShelterCard';
import ProgramCard from '../components/ProgramCard';
import DetailModal from '../components/DetailModal';

// params 에는 { location, data } 가 전달됨 (Home 에서 넘겨준 res.data)
const MapResults = ({ params, onGoBack }) => {
  const [activeTab, setActiveTab] = useState('shelter');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);

  // 통합 검색 결과 데이터 추출
  const shelters = params.data.shelters || [];
  const programs = params.data.programs || [];

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      const container = document.getElementById('map');
      
      // 첫 번째 대피소 위치로 지도를 잡거나 서울 중심으로 설정
      const centerPos = shelters.length > 0 
        ? new window.kakao.maps.LatLng(shelters[0].lat, shelters[0].lng)
        : new window.kakao.maps.LatLng(37.5665, 126.9780);

      const options = { center: centerPos, level: 5 };
      const kakaoMap = new window.kakao.maps.Map(container, options);

      shelters.forEach(shelter => {
        new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(shelter.lat, shelter.lng),
          map: kakaoMap
        });
      });
    }
  }, [shelters]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <div className="w-full md:w-[400px] h-full flex flex-col border-r border-gray-100 bg-white z-10 shadow-xl">
        <div className="p-6 border-b border-gray-50">
          <button onClick={onGoBack} className="text-blue-500 font-bold mb-2 inline-block">← 다시 검색</button>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">"{params.location}" 결과</h2>
        </div>

        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('shelter')}
            className={`flex-1 py-4 text-sm font-bold ${activeTab === 'shelter' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}
          >대피소 ({shelters.length})</button>
          <button 
            onClick={() => setActiveTab('program')}
            className={`flex-1 py-4 text-sm font-bold ${activeTab === 'program' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}
          >지원사업 ({programs.length})</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {activeTab === 'shelter' ? 
            shelters.map(s => <ShelterCard key={s.id} shelter={s} onClick={() => {setSelectedItem(s); setModalType('shelter');}} />) :
            programs.map(p => <ProgramCard key={p.id} program={p} onClick={() => {setSelectedItem(p); setModalType('program');}} />)
          }
        </div>
      </div>

      <div id="map" className="flex-1 h-full bg-gray-100"></div>

      <DetailModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        data={selectedItem} 
        type={modalType} 
      />
    </div>
  );
};

export default MapResults;