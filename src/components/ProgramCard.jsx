// relief-hub/src/components/ProgramCard.jsx
import React from 'react';

const ProgramCard = ({ program, onClick }) => {
  // 프로그램 타입별 강조 색상 지정
  const getTypeStyles = (type) => {
    switch(type) {
      case '금전': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case '의료': return 'bg-red-100 text-red-700 border-red-200';
      case '상담': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div 
      onClick={() => onClick(program)}
      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getTypeStyles(program.type)}`}>
          {program.type} 지원
        </span>
        <span className="text-xs text-gray-400 font-medium">{program.region}</span>
      </div>

      <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors leading-snug">
        {program.title}
      </h3>
      
      <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed italic">
        "{program.eligibility}"
      </p>

      <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">신청기한</span>
          <span className="text-xs text-gray-700 font-semibold">{program.deadline}</span>
        </div>
        <button className="text-blue-600 font-bold text-sm flex items-center gap-0.5">
          자세히 <span className="text-lg leading-none">›</span>
        </button>
      </div>
    </div>
  );
};

export default ProgramCard;