import { createContext, useContext, useReducer } from 'react';

const WeatherContext = createContext();

const initialState = {
  currentWeather: null,
  forecast: null,
  location: null,
  loading: false,
  error: null,
  aiResponse: null,  // AI yanıtı için state ekliyoruz
  weather: null      // Mevcut hava durumu veya tahmin
};

function weatherReducer(state, action) {
  switch (action.type) {
    case 'SET_LOCATION':
      return { ...state, location: action.payload };
    case 'SET_CURRENT_WEATHER':
      return { ...state, currentWeather: action.payload };
    case 'SET_FORECAST':
      return { ...state, forecast: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_AI_RESPONSE':
      return { ...state, aiResponse: action.payload };
    case 'SET_WEATHER':
      return { ...state, weather: action.payload };
    default:
      return state;
  }
}

export function WeatherProvider({ children }) {
  const [state, dispatch] = useReducer(weatherReducer, initialState);

  return (
    <WeatherContext.Provider value={{ state, dispatch }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  return useContext(WeatherContext);
}
