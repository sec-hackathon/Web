// relief-hub/src/components/ShelterCard.jsx
import React from 'react';

const ShelterCard = ({ shelter, onClick }) => {
  // 수용률 계산 (현재 인원 / 전체 용량)
  const occupancyRate = Math.round((shelter.current_occupancy / shelter.capacity) * 100);
  
  // 수용률에 따른 색상 결정
  const getStatusColor = (rate) => {
    if (rate >= 90) return 'bg-red-500';
    if (rate >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div 
      onClick={() => onClick(shelter)}
      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all duration-200 group"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
            {shelter.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{shelter.address}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider text-white ${getStatusColor(occupancyRate)}`}>
          {occupancyRate >= 95 ? '만석' : '이용가능'}
        </span>
      </div>

      {/* 수용 현황 프로그레스 바 */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-600 font-medium">수용 현황</span>
          <span className="text-gray-900 font-bold">{occupancyRate}% ({shelter.current_occupancy}/{shelter.capacity}명)</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${getStatusColor(occupancyRate)}`} 
            style={{ width: `${occupancyRate}%` }}
          ></div>
        </div>
      </div>

      {/* 시설 태그 */}
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {shelter.facilities.slice(0, 3).map(f => (
          <span key={f} className="bg-blue-50 text-blue-600 text-[11px] px-2.5 py-1 rounded-md font-semibold">
            {f}
          </span>
        ))}
        {shelter.facilities.length > 3 && (
          <span className="text-gray-400 text-[11px] self-center">+{shelter.facilities.length - 3}</span>
        )}
      </div>
    </div>
  );
};

export default ShelterCard;