# 날씨-명언 통합 API 문서

## 개요

이 API는 날씨 정보와 명언을 통합하여 제공하는 서비스입니다. OpenWeatherMap API로부터 실시간 날씨 데이터를 가져오고, 여러 명언 API(Quotable, ZenQuotes)로부터 날씨에 어울리는 명언을 제공합니다.

## 엔드포인트

### GET `/api/weather-quote`

날씨 정보와 해당 날씨에 맞는 명언을 함께 반환합니다.

#### 쿼리 파라미터

| 파라미터 | 타입 | 필수 | 설명 | 예시 |
|---------|------|------|------|------|
| `city` | string | 선택 | 도시명 (영문) | `Seoul`, `Tokyo`, `New York` |
| `lat` | number | 선택 | 위도 (좌표 검색 시) | `37.5665` |
| `lon` | number | 선택 | 경도 (좌표 검색 시) | `126.9780` |

**참고**: `lat`과 `lon`이 제공되면 좌표 기반 검색을 우선합니다.

#### 응답 예시

```json
{
  "weather": {
    "location": "Seoul",
    "temperature": 15,
    "feelsLike": 13,
    "condition": "Rain",
    "description": "비",
    "category": "rain"
  },
  "quote": {
    "text": "비는 하늘이 우리에게 주는 선물이다. 그 속에서 새로운 시작을 찾으라.",
    "author": "루미",
    "source": "quotable"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "🌧️ 비오는 날엔 이런 명언이 어울려요"
}
```

### POST `/api/weather-quote`

특정 날씨 카테고리에 맞는 새로운 명언만 반환합니다.

#### 요청 본문

```json
{
  "weatherCategory": "rain"
}
```

#### 가능한 날씨 카테고리

- `rain`: 비/이슬비
- `snow`: 눈
- `clear`: 맑음
- `clouds`: 흐림
- `thunderstorm`: 뇌우/폭풍
- `fog`: 안개/박무
- `default`: 기본

#### 응답 예시

```json
{
  "quote": {
    "text": "Every storm runs out of rain eventually.",
    "author": "Maya Angelou",
    "source": "quotable"
  },
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

## 사용된 외부 API

### 1. OpenWeatherMap API

- **용도**: 실시간 날씨 데이터
- **공식 사이트**: https://openweathermap.org/api
- **요구사항**: API 키 필요 (`NEXT_PUBLIC_WEATHER_API_KEY`)
- **특징**: 
  - 전세계 도시 날씨 정보
  - 좌표/도시명 검색 지원
  - 한국어 설명 지원

### 2. Quotable API

- **용도**: 영문 명언 데이터 (1차 우선)
- **공식 사이트**: https://github.com/lukePeavey/quotable
- **요구사항**: API 키 불필요
- **특징**:
  - 태그 기반 명언 검색
  - 길이 제한 가능
  - 고품질 명언 데이터

### 3. ZenQuotes API

- **용도**: 영문 명언 데이터 (2차 대안)
- **공식 사이트**: https://zenquotes.io/
- **요구사항**: API 키 불필요
- **특징**:
  - 간단한 랜덤 명언 제공
  - Quotable API 실패 시 대안

## 오류 처리

### 오류 응답 형식

```json
{
  "error": "오류 메시지",
  "message": "상세 오류 설명"
}
```

### 주요 오류 상황

1. **날씨 API 실패**: 더미 데이터로 대체
2. **명언 API 실패**: 내장 명언 데이터로 대체
3. **잘못된 도시명**: 기본 도시(서울)로 대체
4. **네트워크 오류**: 500 에러와 함께 오류 메시지 반환

## 날씨별 명언 매칭 로직

### 카테고리 매핑

```javascript
const getQuoteCategory = (weatherMain) => {
  const weather = weatherMain?.toLowerCase();
  
  if (weather?.includes('rain') || weather?.includes('drizzle')) {
    return 'rain';
  }
  if (weather?.includes('snow')) {
    return 'snow';
  }
  if (weather?.includes('clear')) {
    return 'clear';
  }
  if (weather?.includes('cloud')) {
    return 'clouds';
  }
  if (weather?.includes('thunderstorm') || weather?.includes('storm')) {
    return 'thunderstorm';
  }
  if (weather?.includes('fog') || weather?.includes('mist') || weather?.includes('haze')) {
    return 'fog';
  }
  
  return 'default';
};
```

### 명언 태그 매핑

| 날씨 카테고리 | 명언 태그 | 설명 |
|-------------|-----------|------|
| `rain` | `wisdom,life,inspirational` | 성찰과 지혜 관련 |
| `snow` | `nature,peace,wisdom` | 자연과 평화 관련 |
| `clear` | `happiness,success,motivational` | 긍정과 성공 관련 |
| `clouds` | `wisdom,life,philosophy` | 철학과 삶의 지혜 |
| `thunderstorm` | `courage,strength,motivational` | 용기와 강인함 |
| `fog` | `philosophy,wisdom,mystery` | 신비와 철학 |
| `default` | `inspirational,wisdom,life` | 일반적 영감 |

## 사용 예시

### JavaScript Fetch

```javascript
// 서울 날씨와 명언 가져오기
const response = await fetch('/api/weather-quote?city=Seoul');
const data = await response.json();

// 현재 위치 날씨와 명언 가져오기
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;
  const response = await fetch(`/api/weather-quote?lat=${latitude}&lon=${longitude}`);
  const data = await response.json();
});

// 새로운 명언만 가져오기
const newQuote = await fetch('/api/weather-quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ weatherCategory: 'rain' })
});
```

### cURL

```bash
# GET 요청 - 도시별 날씨와 명언
curl "http://localhost:3000/api/weather-quote?city=Seoul"

# GET 요청 - 좌표별 날씨와 명언
curl "http://localhost:3000/api/weather-quote?lat=37.5665&lon=126.9780"

# POST 요청 - 새로운 명언
curl -X POST "http://localhost:3000/api/weather-quote" \
  -H "Content-Type: application/json" \
  -d '{"weatherCategory":"rain"}'
```

## 환경 설정

### 필수 환경 변수

```env
# .env.local 파일에 추가
NEXT_PUBLIC_WEATHER_API_KEY=your_openweather_api_key_here
```

### API 키 발급

1. [OpenWeatherMap](https://openweathermap.org/api) 방문
2. 무료 계정 생성
3. API Keys 페이지에서 새 키 생성
4. `.env.local` 파일에 키 추가

**참고**: API 키가 없어도 더미 데이터로 동작하여 개발/테스트가 가능합니다.

## 성능 및 제한사항

- **OpenWeatherMap**: 무료 계정 기준 1분에 60회 요청 제한
- **Quotable/ZenQuotes**: 일반적인 rate limit 적용
- **응답 시간**: 평균 1-3초 (외부 API 호출 포함)
- **캐싱**: 현재 미구현 (향후 Redis 캐싱 고려) 