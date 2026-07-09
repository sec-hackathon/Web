// relief-hub/src/components/DetailModal.jsx
import React from 'react';

const DetailModal = ({ isOpen, onClose, data, type }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-8 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-black text-gray-900">{type === 'shelter' ? data.name : data.title}</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl font-bold">×</button>
        </div>
        
        {type === 'shelter' ? (
          <div className="space-y-4">
            <p className="text-gray-600">{data.address}</p>
            <div className="bg-blue-50 p-4 rounded-xl font-bold text-blue-700">연락처: {data.contact}</div>
            <div className="grid grid-cols-2 gap-2">
              {data.facilities.map(f => <span key={f} className="bg-gray-100 p-2 rounded-lg text-center text-sm">#{f}</span>)}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed italic">"{data.eligibility}"</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>지역: {data.region}</span>
              <span>문의: {data.contact}</span>
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">자세히 보기</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailModal;