import { useEffect, useState } from 'react';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSun,
  Droplets,
  Heart,
  Loader2,
  MapPin,
  MoonStar,
  Sun,
  ThermometerSun,
} from 'lucide-react';

type WeatherStatus = 'loading' | 'ready' | 'error';
type WeatherVisual = 'sun' | 'moonStar' | 'cloudSun' | 'cloudMoon' | 'cloud' | 'fog' | 'drizzle' | 'rain' | 'storm';

type WeatherState = {
  temperature: number;
  humidity: number | null;
  description: string;
  locationLabel: string;
  visual: WeatherVisual;
};

type WeatherNotice = 'denied' | 'unavailable';

type CurrentWeatherResponse = {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
    is_day?: number;
  };
};

type ReverseGeocodeResult = {
  name?: string;
  admin2?: string;
  admin1?: string;
  country?: string;
};

function getWeatherVisual(weatherCode: number | undefined, isDay: boolean): { description: string; visual: WeatherVisual } {
  const code = weatherCode ?? 0;

  if (code === 0) {
    return {
      description: isDay ? 'Clear sky' : 'Clear night',
      visual: isDay ? 'sun' : 'moonStar',
    };
  }

  if ([1, 2].includes(code)) {
    return {
      description: 'Partly cloudy',
      visual: isDay ? 'cloudSun' : 'cloudMoon',
    };
  }

  if (code === 3) {
    return { description: 'Cloudy', visual: 'cloud' };
  }

  if ([45, 48].includes(code)) {
    return { description: 'Foggy', visual: 'fog' };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return { description: 'Drizzle', visual: 'drizzle' };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { description: 'Rainy', visual: 'rain' };
  }

  if ([95, 96, 99].includes(code)) {
    return { description: 'Stormy', visual: 'storm' };
  }

  return {
    description: isDay ? 'Mostly clear' : 'Mostly clear night',
    visual: isDay ? 'sun' : 'moonStar',
  };
}

function formatLocationLabel(result?: ReverseGeocodeResult | null) {
  if (!result) {
    return 'Location unavailable';
  }

  return result.name ?? result.admin2 ?? result.admin1 ?? result.country ?? 'Location unavailable';
}

function WeatherIcon({ visual }: { visual: WeatherVisual }) {
  switch (visual) {
    case 'sun':
      return <Sun size={13} className="text-text-muted sm:size-[14px]" />;
    case 'moonStar':
      return <MoonStar size={13} className="text-text-muted sm:size-[14px]" />;
    case 'cloudSun':
      return <CloudSun size={13} className="text-text-muted sm:size-[14px]" />;
    case 'cloudMoon':
      return <CloudMoon size={13} className="text-text-muted sm:size-[14px]" />;
    case 'cloud':
      return <Cloud size={13} className="text-text-muted sm:size-[14px]" />;
    case 'fog':
      return <CloudFog size={13} className="text-text-muted sm:size-[14px]" />;
    case 'drizzle':
      return <CloudDrizzle size={13} className="text-text-muted sm:size-[14px]" />;
    case 'rain':
      return <CloudRain size={13} className="text-text-muted sm:size-[14px]" />;
    case 'storm':
      return <CloudLightning size={13} className="text-text-muted sm:size-[14px]" />;
    default:
      return <Sun size={13} className="text-text-muted sm:size-[14px]" />;
  }
}

export function Topbar() {
  const [weatherStatus, setWeatherStatus] = useState<WeatherStatus>('loading');
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [weatherNotice, setWeatherNotice] = useState<WeatherNotice | null>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setWeatherNotice('unavailable');
      setWeatherStatus('error');
      return;
    }

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const [weatherResult, locationResult] = await Promise.allSettled([
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,is_day&temperature_unit=celsius&timezone=auto`,
            ),
            fetch(
              `${backendUrl}/api/weather/location?latitude=${latitude}&longitude=${longitude}`,
            ),
          ]);

          if (cancelled) {
            return;
          }

          if (weatherResult.status !== 'fulfilled' || !weatherResult.value.ok) {
            throw new Error('Weather request failed.');
          }

          const weatherJson = (await weatherResult.value.json()) as CurrentWeatherResponse;
          const current = weatherJson.current;

          if (typeof current?.temperature_2m !== 'number' || typeof current.is_day !== 'number') {
            throw new Error('Weather data was incomplete.');
          }

          const locationJson =
            locationResult.status === 'fulfilled'
              ? ((await locationResult.value.json().catch(() => null)) as { locationLabel?: string; place?: ReverseGeocodeResult | null } | null)
              : null;

          const nearestPlace = locationJson?.place ?? null;
          const weatherVisual = getWeatherVisual(current.weather_code, current.is_day === 1);

          setWeather({
            temperature: current.temperature_2m,
            humidity: typeof current.relative_humidity_2m === 'number' ? current.relative_humidity_2m : null,
            description: weatherVisual.description,
            locationLabel: locationJson?.locationLabel ?? formatLocationLabel(nearestPlace),
            visual: weatherVisual.visual,
          });
          setWeatherStatus('ready');
        } catch (error) {
          if (!cancelled) {
            console.error('Failed to load weather data:', error);
            setWeatherStatus('error');
          }
        }
      },
      (error) => {
        if (!cancelled) {
          setWeatherNotice(error.code === 1 ? 'denied' : 'unavailable');
          setWeatherStatus('error');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 30 * 60 * 1000 },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="h-16 bg-card border-b border-mist-light flex items-center px-4 md:px-8 gap-3 md:gap-4">
      <div className="flex items-center gap-2 md:hidden">
        <Heart size={20} className="text-dusk" />
        <span className="font-display text-xl italic font-semibold whitespace-nowrap text-forest">
          MindScope
        </span>
      </div>

      <div className="mr-auto" />

      <div className="flex items-center gap-1.5 sm:gap-2 bg-card-alt border border-mist-light rounded-md px-2 py-1.5 sm:px-3.5 sm:py-1.5 font-body text-[10px] sm:text-[13px] text-text-body min-w-0 sm:min-w-[240px] justify-between sm:justify-start max-w-[calc(100vw-88px)] sm:max-w-none">
        {weatherStatus === 'loading' ? (
          <>
            <Loader2 size={13} className="text-text-muted sm:size-[14px] animate-spin" />
            <span className="font-medium text-text-muted">Locating weather</span>
          </>
        ) : weatherStatus === 'error' || !weather ? (
          <>
            <MapPin size={13} className="text-text-muted sm:size-[14px]" />
            <span className="font-medium text-text-muted">
              {weatherNotice === 'denied'
                ? 'Location blocked. Turn it on to see weather.'
                : 'Enable location to see weather'}
            </span>
          </>
        ) : (
          <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-sage/10 ring-1 ring-sage/15">
              <WeatherIcon visual={weather.visual} />
            </div>
            <span className="font-semibold sm:font-medium whitespace-nowrap text-forest sm:text-text-body">
              {Math.round(weather.temperature)} C
            </span>
            <span className="truncate max-w-[56px] sm:max-w-[120px] text-text-muted">
              {weather.description}
            </span>
            <span className="w-px h-3 sm:h-4 bg-mist-light mx-0.5 sm:mx-1 shrink-0" />
            <Droplets size={11} className="text-text-muted shrink-0 sm:size-[13px]" />
            <span className="whitespace-nowrap">{weather.humidity ?? '--'}%</span>
            <span className="w-px h-3 sm:h-4 bg-mist-light mx-0.5 sm:mx-1 shrink-0" />
            <ThermometerSun size={11} className="text-text-muted shrink-0 sm:size-[13px]" />
            <span className="truncate max-w-[64px] sm:max-w-[140px] text-text-muted">
              {weather.locationLabel}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
