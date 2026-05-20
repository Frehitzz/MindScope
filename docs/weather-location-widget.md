# Weather Location Widget

## What I implemented

I replaced the hardcoded weather chip in the top bar with a live weather widget that uses the browser's location permission and the free Open-Meteo API.

The widget now:

1. Prompts the user for location access through the browser geolocation API.
2. Uses the returned latitude and longitude to request current weather from Open-Meteo.
3. Uses a backend reverse-geocoding proxy to show the nearest place label.
4. Renders temperature, weather description, humidity, and location in the header.
5. Falls back to a friendly message if location access is denied or the browser does not support geolocation.

## Why Open-Meteo

I chose Open-Meteo because it is free to use, does not require an API key, and works directly with coordinates. That makes it a good fit for a location-based widget in a frontend app because the user only needs to grant browser location access.

It also keeps the implementation lightweight. There is no account setup, no secret key to store in the frontend, and the backend proxy keeps the browser free of CORS issues.

## How it works

The implementation lives in [frontend/src/components/Topbar.tsx](../frontend/src/components/Topbar.tsx).

The flow is:

1. On mount, the component checks whether `navigator.geolocation` is available.
2. If it is available, the browser asks the user for permission.
3. Once permission is granted, the app fetches:
   - `https://api.open-meteo.com/v1/forecast` for current weather.
   - A same-origin backend route at `/api/weather/location` for the place name.
4. The response is converted into a small local weather state object.
5. The top bar renders the current weather in the same chip area that previously showed static demo data.

## Fallback behavior

If the user denies location access, if geolocation is unavailable, or if the weather request fails, the widget does not break the page. It simply shows a short message telling the user to enable location.

This keeps the UI stable and avoids blocking the rest of the dashboard.

## Why this structure

I kept the feature inside the top bar because the weather chip already existed there and it is a natural place for a location-aware summary.

I also kept the logic self-contained so the feature is easy to understand and easy to replace later if you want to move it into a dedicated hook or service.

## Notes

The browser will only show real weather after the user approves location access. That is expected behavior and is required for a true local-weather experience.

The reverse geocoding request moved to the backend because the browser should not call the geocoding service directly, and the backend can safely normalize the city, town, or region fields for the widget.
