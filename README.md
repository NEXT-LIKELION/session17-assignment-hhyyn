[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/gZq6QRLR)

# 날씨별 명언 웹앱 🌦️💭

"비오는 날엔 이런 명언이 어울려요" - 현재 날씨에 맞는 특별한 명언을 제공하는 웹 애플리케이션입니다.

![프로젝트 데모](./public/image.png)

## 🌟 주요 기능

- **🌤️ 실시간 날씨 정보**: OpenWeatherMap API를 통한 정확한 날씨 데이터
- **💭 AI 맞춤 명언**: 외부 명언 API(Quotable, ZenQuotes)에서 날씨별 명언 제공
- **🔗 API 통합**: 두 개의 외부 API를 하나의 엔드포인트로 통합
- **📍 위치 기반 서비스**: 현재 위치 또는 원하는 도시의 날씨 확인
- **📱 반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기에서 최적화
- **🎨 동적 배경**: 날씨에 따라 변하는 아름다운 그라데이션 배경
- **✨ 직관적 UI**: 날씨 아이콘과 함께 한눈에 보기 쉬운 인터페이스

## 🌈 날씨별 제공 명언

- **☀️ 맑은 날**: 긍정적이고 희망찬 명언
- **🌧️ 비오는 날**: 성찰적이고 감성적인 명언  
- **❄️ 눈오는 날**: 순수하고 평화로운 명언
- **☁️ 흐린 날**: 차분하고 사려깊은 명언
- **⛈️ 폭풍우**: 강인함과 극복에 관한 명언
- **🌫️ 안개**: 신비롭고 철학적인 명언

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes (서버리스 함수)
- **외부 APIs**: 
  - 🌤️ OpenWeatherMap API (실시간 날씨 데이터)
  - 💭 Quotable API (1차 명언 제공)
  - 📝 ZenQuotes API (2차 명언 제공)
- **배포**: Vercel (권장)

## 🔗 API 통합 아키텍처

```
클라이언트 → /api/weather-quote → OpenWeatherMap API
                                  → Quotable API
                                  → ZenQuotes API (대안)
                                  → 내장 명언 DB (최후 대안)
```

## 📱 사용법

1. **자동 위치**: "📍 현재 위치 날씨" 버튼을 클릭하여 현재 위치의 날씨와 명언 확인
2. **도시 검색**: 하단의 검색창에 원하는 도시명 입력 (예: Seoul, Tokyo, New York)
3. **새 명언**: "💫 새로운 명언" 버튼으로 같은 날씨의 다른 명언 보기
4. **새로고침**: "🔄 새로고침" 버튼으로 최신 날씨 정보 업데이트

## 🎨 특별한 기능

- **날씨별 테마**: 각 날씨에 맞는 색상과 분위기
- **부드러운 애니메이션**: 부드러운 전환 효과
- **글래스모피즘**: 현대적인 반투명 카드 디자인
- **반응형 타이포그래피**: 기기에 따라 최적화된 글꼴 크기

---

**💡 팁**: 비오는 날 이 앱을 실행해보세요. 특별한 명언이 당신을 기다리고 있습니다! 🌧️✨
