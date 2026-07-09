import React from 'react';

const DetailModal = ({ isOpen, onClose, data, type }) => {
    if (!isOpen || !data) return null;

    const getDirectionUrl = (shelter) => {
        const lat = Number(shelter.lat);
        const lng = Number(shelter.lng);
        const hasCoordinate = Number.isFinite(lat) && Number.isFinite(lng);
        const label = shelter.name || shelter.address || '대피소';

        if (!hasCoordinate) {
            return `https://map.kakao.com/link/search/${encodeURIComponent(shelter.address || label)}`;
        }

        return `https://map.kakao.com/link/to/${encodeURIComponent(label)},${lat},${lng}`;
    };

    const getProgramUrl = (program) =>
        program.link || `https://www.google.com/search?q=${encodeURIComponent(program.title || '재난 지원 사업')}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-8">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-black text-gray-900">{type === 'shelter' ? data.name : data.title}</h2>
                    <button onClick={onClose} className="text-gray-400 text-2xl font-bold">×</button>
                </div>

                {type === 'shelter' ? (
                    <div className="space-y-4">
                        <p className="text-gray-600">{data.address}</p>
                        <div className="bg-blue-50 p-4 rounded-xl font-bold text-blue-700">연락처: {data.contact}</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {data.aggregateCount ? (
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-xs font-bold text-slate-400">시설 수</p>
                                    <p className="font-black text-slate-900">{data.aggregateCount.toLocaleString()}개소</p>
                                </div>
                            ) : null}
                            {data.capacity ? (
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-xs font-bold text-slate-400">수용능력</p>
                                    <p className="font-black text-slate-900">{Number(data.capacity).toLocaleString()}명</p>
                                </div>
                            ) : null}
                            {data.area ? (
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-xs font-bold text-slate-400">면적</p>
                                    <p className="font-black text-slate-900">{data.area}㎡</p>
                                </div>
                            ) : null}
                            {data.dataDate ? (
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-xs font-bold text-slate-400">자료시점</p>
                                    <p className="font-black text-slate-900">{data.dataDate}</p>
                                </div>
                            ) : null}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {(data.facilities || []).map(f => <span key={f} className="bg-gray-100 p-2 rounded-lg text-center text-sm">#{f}</span>)}
                        </div>

                        <a
                            href={getDirectionUrl(data)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3.5 rounded-xl font-bold transition-all mt-4"
                        >
                            카카오맵으로 길찾기 ➔
                        </a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-gray-700 leading-relaxed italic">"{data.eligibility}"</p>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>지역: {data.region}</span>
                            <span>문의: {data.contact}</span>
                        </div>
                        <a
                            href={getProgramUrl(data)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-center"
                        >
                            자세히 보기
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailModal;
