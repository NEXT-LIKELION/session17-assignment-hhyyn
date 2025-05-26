import { NextResponse } from 'next/server';

// 날씨별 명언 카테고리 매핑
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

// 날씨별 명언 태그 매핑 (외부 API용)
const getQuoteTags = (weatherCategory) => {
  const tagMapping = {
    'rain': 'wisdom,life,inspirational',
    'snow': 'nature,peace,wisdom',
    'clear': 'happiness,success,motivational',
    'clouds': 'wisdom,life,philosophy',
    'thunderstorm': 'courage,strength,motivational',
    'fog': 'philosophy,wisdom,mystery',
    'default': 'inspirational,wisdom,life'
  };
  
  return tagMapping[weatherCategory] || tagMapping.default;
};

// 날씨 정보 가져오기
async function getWeatherData(city, lat, lon) {
  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  
  if (!API_KEY) {
    // 더미 데이터 반환
    return {
      weather: [{ main: 'Rain', description: '비' }],
      main: { temp: 20, feels_like: 22 },
      name: city || '서울'
    };
  }

  try {
    let url;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city || 'Seoul'}&appid=${API_KEY}&units=metric&lang=kr`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('날씨 정보를 가져올 수 없습니다.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('날씨 API 오류:', error);
    // 오류 시 더미 데이터 반환
    return {
      weather: [{ main: 'Clear', description: '맑음' }],
      main: { temp: 20, feels_like: 22 },
      name: city || '서울'
    };
  }
}

// 명언 API에서 데이터 가져오기
async function getQuoteFromAPI(weatherCategory) {
  const tags = getQuoteTags(weatherCategory);
  
  try {
    // Quotable API 사용
    const response = await fetch(`https://api.quotable.io/random?tags=${tags}&minLength=30&maxLength=200`);
    
    if (response.ok) {
      const data = await response.json();
      return {
        text: data.content,
        author: data.author,
        source: 'quotable'
      };
    }
  } catch (error) {
    console.error('Quotable API 오류:', error);
  }

  // 대안 API - ZenQuotes
  try {
    const response = await fetch('https://zenquotes.io/api/random');
    
    if (response.ok) {
      const data = await response.json();
      if (data && data[0]) {
        return {
          text: data[0].q,
          author: data[0].a,
          source: 'zenquotes'
        };
      }
    }
  } catch (error) {
    console.error('ZenQuotes API 오류:', error);
  }

  // 모든 API 실패 시 날씨별 기본 명언 반환
  const fallbackQuotes = {
    rain: {
      text: "비는 하늘이 우리에게 주는 선물이다. 그 속에서 새로운 시작을 찾으라.",
      author: "루미",
      source: 'fallback'
    },
    snow: {
      text: "눈송이 하나하나가 모여 겨울의 기적을 만든다.",
      author: "익명",
      source: 'fallback'
    },
    clear: {
      text: "맑은 하늘은 무한한 가능성을 상징한다.",
      author: "익명",
      source: 'fallback'
    },
    clouds: {
      text: "구름은 하늘의 생각이다.",
      author: "랄프 왈도 에머슨",
      source: 'fallback'
    },
    thunderstorm: {
      text: "폭풍 속에서도 춤출 수 있는 사람이 되어라.",
      author: "니체",
      source: 'fallback'
    },
    fog: {
      text: "안개는 신비로움을 선사하는 자연의 마법이다.",
      author: "익명",
      source: 'fallback'
    },
    default: {
      text: "오늘은 어제와 다른 새로운 하루다.",
      author: "익명",
      source: 'fallback'
    }
  };

  return fallbackQuotes[weatherCategory] || fallbackQuotes.default;
}

// GET 요청 처리
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    // 1. 날씨 정보 가져오기
    const weatherData = await getWeatherData(city, lat, lon);
    
    // 2. 날씨에 맞는 명언 카테고리 결정
    const weatherCategory = getQuoteCategory(weatherData.weather[0].main);
    
    // 3. 명언 API에서 데이터 가져오기
    const quote = await getQuoteFromAPI(weatherCategory);

    // 4. 통합된 응답 반환
    const response = {
      weather: {
        location: weatherData.name,
        temperature: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        condition: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        category: weatherCategory
      },
      quote: {
        text: quote.text,
        author: quote.author,
        source: quote.source
      },
      timestamp: new Date().toISOString(),
      message: `${weatherData.weather[0].main.toLowerCase().includes('rain') ? '🌧️ 비오는 날엔 이런 명언이 어울려요' : `${weatherData.weather[0].main} 날씨에 어울리는 명언이에요`}`
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('API 오류:', error);
    
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다.',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// POST 요청 처리 (새로운 명언만 가져오기)
export async function POST(request) {
  try {
    const { weatherCategory } = await request.json();
    
    if (!weatherCategory) {
      return NextResponse.json(
        { error: '날씨 카테고리가 필요합니다.' },
        { status: 400 }
      );
    }

    const quote = await getQuoteFromAPI(weatherCategory);

    return NextResponse.json({
      quote: {
        text: quote.text,
        author: quote.author,
        source: quote.source
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('명언 API 오류:', error);
    
    return NextResponse.json(
      { 
        error: '명언을 가져오는 중 오류가 발생했습니다.',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 