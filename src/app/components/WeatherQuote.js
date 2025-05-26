'use client';

import { useState, useEffect } from 'react';

export default function WeatherQuote() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState('Seoul');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  // 날씨 아이콘 매핑
  const getWeatherIcon = (weatherMain) => {
    const icons = {
      'clear': '☀️',
      'clouds': '☁️', 
      'rain': '🌧️',
      'drizzle': '🌦️',
      'thunderstorm': '⛈️',
      'snow': '❄️',
      'fog': '🌫️',
      'mist': '🌫️',
      'haze': '🌫️'
    };
    
    return icons[weatherMain?.toLowerCase()] || '🌤️';
  };

  // 날씨별 배경 색상
  const getBackgroundClass = (weatherMain) => {
    const weather = weatherMain?.toLowerCase();
    
    if (weather?.includes('rain') || weather?.includes('drizzle')) {
      return 'from-gray-600 to-blue-800';
    }
    if (weather?.includes('snow')) {
      return 'from-blue-200 to-white';
    }
    if (weather?.includes('clear')) {
      return 'from-yellow-400 to-orange-500';
    }
    if (weather?.includes('cloud')) {
      return 'from-gray-400 to-gray-600';
    }
    if (weather?.includes('thunderstorm')) {
      return 'from-gray-800 to-purple-900';
    }
    if (weather?.includes('fog') || weather?.includes('mist')) {
      return 'from-gray-300 to-gray-500';
    }
    
    return 'from-blue-400 to-purple-600';
  };

  // 날씨 설명 한글화
  const getWeatherDescription = (weatherMain) => {
    const descriptions = {
      'clear': '맑음',
      'clouds': '흐림',
      'rain': '비',
      'drizzle': '이슬비',
      'thunderstorm': '뇌우',
      'snow': '눈',
      'fog': '안개',
      'mist': '박무',
      'haze': '연무'
    };
    
    return descriptions[weatherMain?.toLowerCase()] || weatherMain;
  };

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('위치 서비스가 지원되지 않습니다.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  // 통합 API에서 날씨와 명언 데이터 가져오기
  const fetchWeatherAndQuote = async (cityName = null, coords = null) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api/weather-quote';
      const params = new URLSearchParams();
      
      if (coords) {
        params.append('lat', coords.lat.toString());
        params.append('lon', coords.lon.toString());
      } else {
        params.append('city', cityName || city);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('데이터를 가져오는데 실패했습니다.');
      }
      
      const result = await response.json();
      setData(result);
      
    } catch (err) {
      setError(err.message || '데이터를 가져오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 현재 위치 날씨 가져오기
  const fetchCurrentLocationWeather = async () => {
    try {
      setUseCurrentLocation(true);
      const coords = await getCurrentLocation();
      await fetchWeatherAndQuote(null, coords);
    } catch (err) {
      setError('위치 정보를 가져올 수 없습니다. 서울 날씨를 표시합니다.');
      setUseCurrentLocation(false);
      await fetchWeatherAndQuote('Seoul');
    }
  };

  // 새로운 명언만 가져오기
  const fetchNewQuote = async () => {
    if (!data?.weather?.category) return;
    
    try {
      const response = await fetch('/api/weather-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weatherCategory: data.weather.category
        }),
      });
      
      if (!response.ok) {
        throw new Error('새로운 명언을 가져오는데 실패했습니다.');
      }
      
      const result = await response.json();
      
      // 기존 데이터를 유지하면서 명언만 업데이트
      setData(prevData => ({
        ...prevData,
        quote: result.quote,
        timestamp: result.timestamp
      }));
      
    } catch (err) {
      console.error('새로운 명언 가져오기 실패:', err);
      setError('새로운 명언을 가져오는데 실패했습니다.');
    }
  };

  // 컴포넌트 마운트 시 기본 데이터 가져오기
  useEffect(() => {
    fetchWeatherAndQuote();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse flex flex-col items-center">
          <div className="text-6xl mb-4">🌤️</div>
          <div>날씨와 명언을 가져오는 중...</div>
          <div className="text-lg mt-2 opacity-75">두 개의 API를 통합하고 있어요</div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
        <div className="text-white text-xl text-center p-8">
          <div className="mb-4">⚠️</div>
          <div>{error}</div>
          <button 
            onClick={() => fetchWeatherAndQuote()}
            className="mt-4 px-6 py-2 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const backgroundClass = data?.weather ? getBackgroundClass(data.weather.condition) : 'from-blue-400 to-purple-600';
  const weatherIcon = data?.weather ? getWeatherIcon(data.weather.condition) : '🌤️';
  const weatherDesc = data?.weather ? getWeatherDescription(data.weather.condition) : '';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundClass} transition-all duration-1000`}>
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            오늘의 날씨와 명언
          </h1>
          <p className="text-xl text-white/90 drop-shadow">
            두 개의 API가 만나 탄생한 특별한 조합
          </p>
          <p className="text-lg text-white/80 mt-2">
            날씨 API + 명언 API = 완벽한 하루의 시작
          </p>
        </div>

        {/* 날씨 정보 카드 */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 mb-8 shadow-2xl">
            <div className="text-center">
              <div className="text-8xl mb-4">{weatherIcon}</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {data?.weather?.location || '서울'}
              </h2>
              <p className="text-xl text-white/90 mb-4">
                {weatherDesc} • {data?.weather?.temperature || 20}°C
              </p>
              <p className="text-lg text-white/80">
                체감온도 {data?.weather?.feelsLike || 22}°C
              </p>
              <div className="mt-4 text-sm text-white/60">
                🌐 OpenWeatherMap API 제공
              </div>
            </div>
          </div>

          {/* 명언 카드 */}
          {data?.quote && (
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 mb-8 shadow-2xl">
              <div className="text-center">
                <div className="text-6xl mb-6">💭</div>
                <blockquote className="text-2xl md:text-3xl font-medium text-white mb-6 leading-relaxed">
                  "{data.quote.text}"
                </blockquote>
                <p className="text-xl text-white/80 mb-4">
                  - {data.quote.author}
                </p>
                <div className="text-sm text-white/60">
                  💬 {data.quote.source === 'quotable' ? 'Quotable API' : 
                      data.quote.source === 'zenquotes' ? 'ZenQuotes API' : 
                      '내장 명언'} 제공
                </div>
              </div>
            </div>
          )}

          {/* API 통합 정보 */}
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-xl">
            <div className="text-center text-white/90">
              <h3 className="text-lg font-semibold mb-2">🔗 통합 API 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">🌤️ 날씨 데이터</div>
                  <div className="opacity-80">OpenWeatherMap API</div>
                </div>
                <div>
                  <div className="font-medium">💭 명언 데이터</div>
                  <div className="opacity-80">
                    {data?.quote?.source === 'quotable' ? 'Quotable API' : 
                     data?.quote?.source === 'zenquotes' ? 'ZenQuotes API' : 
                     '내장 명언 DB'}
                  </div>
                </div>
              </div>
              {data?.timestamp && (
                <div className="text-xs opacity-70 mt-2">
                  마지막 업데이트: {new Date(data.timestamp).toLocaleString('ko-KR')}
                </div>
              )}
            </div>
          </div>

          {/* 컨트롤 버튼들 */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <button
              onClick={fetchCurrentLocationWeather}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              📍 현재 위치 날씨
            </button>
            
            <button
              onClick={fetchNewQuote}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              💫 새로운 명언
            </button>
            
            <button
              onClick={() => fetchWeatherAndQuote()}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              🔄 전체 새로고침
            </button>
          </div>

          {/* 도시 검색 */}
          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchWeatherAndQuote(city)}
                placeholder="도시명을 입력하세요 (예: Seoul, Tokyo, New York)"
                className="flex-1 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                onClick={() => fetchWeatherAndQuote(city)}
                className="px-6 py-3 bg-white/30 hover:bg-white/40 text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                검색
              </button>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="text-center mt-12 text-white/70">
          <p className="text-lg">
            {data?.message || '🌤️ 날씨에 어울리는 명언이에요'}
          </p>
          <p className="text-sm mt-2 opacity-75">
            실시간 날씨 + 명언 API 통합 서비스
          </p>
        </div>
      </div>
    </div>
  );
} 