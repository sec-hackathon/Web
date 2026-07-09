import React, { useEffect, useMemo, useRef, useState } from 'react';
import ShelterCard from '../components/ShelterCard';
import ProgramCard from '../components/ProgramCard';
import DetailModal from '../components/DetailModal';

const DEFAULT_CENTER = { lat: 37.5334, lng: 127.002 };

const isValidCoordinate = (lat, lng) =>
  Number.isFinite(Number(lat)) &&
  Number.isFinite(Number(lng)) &&
  Number(lat) >= 33 &&
  Number(lat) <= 39 &&
  Number(lng) >= 124 &&
  Number(lng) <= 132;

const escapeHtml = (value) =>
  String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));

const geocodeAddress = (geocoder, address) =>
  new Promise((resolve) => {
    if (!address || address === '주소 정보 없음') {
      resolve(null);
      return;
    }

    geocoder.addressSearch(address, (result, status) => {
      if (status !== window.kakao.maps.services.Status.OK || !result?.[0]) {
        resolve(null);
        return;
      }

      resolve({
        lat: Number(result[0].y),
        lng: Number(result[0].x),
      });
    });
  });

const makeSpreadCoordinate = (lat, lng, index, total) => {
  if (total <= 1) return { lat, lng };

  const ring = Math.floor(index / 8) + 1;
  const angle = ((index % 8) / 8) * Math.PI * 2 + ring * 0.35;
  const radius = 0.012 * ring;

  return {
    lat: lat + Math.sin(angle) * radius,
    lng: lng + Math.cos(angle) * radius,
  };
};

const expandAggregateShelters = (shelter) => {
  if (!shelter.isAggregate || !isValidCoordinate(shelter.lat, shelter.lng)) {
    return [shelter];
  }

  const markerCount = Math.max(1, Math.min(Math.ceil(Number(shelter.aggregateCount || 1) / 50), 30));

  return Array.from({ length: markerCount }, (_, index) => {
    const coordinate = makeSpreadCoordinate(shelter.lat, shelter.lng, index, markerCount);
    return {
      ...shelter,
      id: `${shelter.id}-marker-${index}`,
      name: `${shelter.address} ${shelter.raw?.시설구분 || '대피소'} 대표 ${index + 1}`,
      lat: coordinate.lat,
      lng: coordinate.lng,
      representativeIndex: index + 1,
      representativeTotal: markerCount,
    };
  });
};

const getDirectionUrl = (place) => {
  const lat = Number(place.lat);
  const lng = Number(place.lng);
  const label = place.name || place.address || '목적지';

  if (!isValidCoordinate(lat, lng)) {
    return `https://map.kakao.com/link/search/${encodeURIComponent(place.address || label)}`;
  }

  return `https://map.kakao.com/link/to/${encodeURIComponent(label)},${lat},${lng}`;
};

const MapResults = ({ shelters = [], programs = [], location, onGoBack }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const [resolvedShelters, setResolvedShelters] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedType, setSelectedType] = useState('shelter');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sheltersWithCoordinates = useMemo(
    () => resolvedShelters.filter((shelter) => isValidCoordinate(shelter.lat, shelter.lng)),
    [resolvedShelters]
  );

  const openModal = (data, type) => {
    setSelectedData(data);
    setSelectedType(type);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!window.kakao?.maps) return;

    let cancelled = false;

    window.kakao.maps.load(async () => {
      const geocoder = new window.kakao.maps.services.Geocoder();

      const resolved = await Promise.all(
        shelters.map(async (shelter) => {
          if (isValidCoordinate(shelter.lat, shelter.lng)) {
            return {
              ...shelter,
              lat: Number(shelter.lat),
              lng: Number(shelter.lng),
            };
          }

          const coordinate = await geocodeAddress(geocoder, shelter.address);
          return coordinate ? { ...shelter, ...coordinate } : shelter;
        })
      );

      if (!cancelled) {
        setResolvedShelters(resolved.flatMap(expandAggregateShelters));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [shelters]);

  useEffect(() => {
    if (!window.kakao?.maps) return;

    window.kakao.maps.load(() => {
      const container = mapContainerRef.current;
      if (!container) return;

      const firstShelter = sheltersWithCoordinates[0];
      const center = firstShelter
        ? new window.kakao.maps.LatLng(firstShelter.lat, firstShelter.lng)
        : new window.kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);

      if (!mapRef.current) {
        mapRef.current = new window.kakao.maps.Map(container, {
          center,
          level: 5,
        });
        infoWindowRef.current = new window.kakao.maps.InfoWindow({ zIndex: 1 });
      } else {
        mapRef.current.setCenter(center);
        mapRef.current.setLevel(5);
      }

      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      if (sheltersWithCoordinates.length === 0) return;

      const bounds = new window.kakao.maps.LatLngBounds();

      sheltersWithCoordinates.forEach((shelter) => {
        const position = new window.kakao.maps.LatLng(shelter.lat, shelter.lng);
        const marker = new window.kakao.maps.Marker({
          position,
          title: shelter.name,
        });

        window.kakao.maps.event.addListener(marker, 'click', () => {
          infoWindowRef.current.setContent(
            `<div style="padding:8px 10px;font-size:13px;font-weight:700;white-space:nowrap;">${escapeHtml(shelter.name)}</div>`
          );
          infoWindowRef.current.open(mapRef.current, marker);
          openModal(shelter, 'shelter');
        });

        marker.setMap(mapRef.current);
        markersRef.current.push(marker);
        bounds.extend(position);
      });

      if (sheltersWithCoordinates.length <= 2) {
        mapRef.current.setCenter(center);
        mapRef.current.setLevel(5);
      } else {
        mapRef.current.setBounds(bounds);
      }
    });
  }, [sheltersWithCoordinates]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">{location || '검색 결과'}</p>
            <h1 className="text-2xl font-black text-slate-900">주변 지원 정보</h1>
          </div>
          <button
            type="button"
            onClick={onGoBack}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            다시 검색
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[minmax(360px,420px)_1fr]">
        <section className="order-2 space-y-5 lg:order-1">
          <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-blue-600">지도 표시 정보</p>
                <h2 className="mt-1 text-lg font-black text-slate-900">
                  {location ? `${location} 대피소` : '기본 대피소'}
                </h2>
              </div>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <p>대피소 위치 기준으로 핀을 표시합니다.</p>
              <p className="text-xs text-slate-400">
                표시 가능 {sheltersWithCoordinates.length}개 핀 / 전체 {resolvedShelters.length}개 항목
              </p>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-end justify-between">
              <h2 className="text-lg font-black text-slate-900">대피소 핀 {resolvedShelters.length}개</h2>
              {resolvedShelters.length > sheltersWithCoordinates.length && (
                <span className="text-xs font-semibold text-amber-600">
                  좌표 확인 필요 {resolvedShelters.length - sheltersWithCoordinates.length}곳
                </span>
              )}
            </div>

            <div className="space-y-3">
              {resolvedShelters.length > 0 ? (
                resolvedShelters.map((shelter) => (
                  <div key={shelter.id} className="space-y-2">
                    <ShelterCard
                      shelter={shelter}
                      onClick={() => openModal(shelter, 'shelter')}
                    />
                    <a
                      href={getDirectionUrl(shelter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-blue-200 bg-white px-4 py-2 text-center text-sm font-bold text-blue-700 hover:bg-blue-50"
                    >
                      이 대피소 길찾기
                    </a>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
                  검색된 대피소가 없습니다. 시/군/구 단위로 다시 검색해보세요.
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-black text-slate-900">지원 프로그램</h2>
            <div className="space-y-3">
              {programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onClick={() => openModal(program, 'program')}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="order-1 lg:order-2">
          <div className="sticky top-[89px] h-[420px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:h-[calc(100vh-112px)]">
            <div ref={mapContainerRef} className="h-full w-full" />
          </div>
        </section>
      </main>

      <DetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedData}
        type={selectedType}
      />
    </div>
  );
};

export default MapResults;
