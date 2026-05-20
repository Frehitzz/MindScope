WEATHER WIDGET WITH LIVE POLLING

Project: MindScope
Feature: Topbar Weather Widget
Main File: frontend/src/components/Topbar.tsx


1. OVERVIEW

This document explains the weather widget implemented in the top bar of the MindScope frontend.

The feature replaces the old static weather display with a live weather widget that uses the user’s current location, fetches real weather data, shows the detected place name, and refreshes the weather automatically every 30 seconds.

This document is written in a simple format so it can be copied directly into Google Docs with minimal cleanup.


2. FEATURE SUMMARY

The weather widget now does the following:

1. Requests the user’s location through the browser geolocation API.
2. Uses the latitude and longitude to fetch current weather data from Open-Meteo.
3. Uses the backend weather route to resolve the location label shown in the UI.
4. Displays the weather icon, temperature, weather condition, humidity, and location in the top bar.
5. Refreshes the weather data every 30 seconds.
6. Keeps the location label from the first successful lookup instead of requesting it again on every refresh.
7. Shows visible loading and refreshing UI states so users can see that live polling is working.
8. Falls back to a safe message when location access is denied or unavailable.


3. OBJECTIVE OF THE FEATURE

The goal of this feature is to make the top bar weather section dynamic and location-aware instead of static.

It also demonstrates real-time frontend behavior through polling, which means the system automatically updates the weather at a fixed interval without requiring the user to reload the page.


4. FILES INVOLVED

The main file used for this feature is:

frontend/src/components/Topbar.tsx

This component contains:

- the weather state
- the geolocation request
- the API fetch logic
- the polling logic
- the loading, success, and error UI states

The related backend route used for location naming is:

backend/routes/weather.js


5. HOW THE FEATURE WORKS

The weather widget follows this process:

1. The Topbar component loads when the frontend page renders.
2. The component checks whether the browser supports geolocation.
3. If geolocation is available, the browser asks the user for permission.
4. After permission is granted, the app gets the latitude and longitude.
5. The app requests live weather data from Open-Meteo.
6. The app requests the readable place name from the backend weather route.
7. The component stores the returned weather information in React state.
8. The UI updates and shows the live weather in the top bar.
9. A 30-second interval starts.
10. Every 30 seconds, only the weather API is called again.
11. The location label is reused from the first successful lookup.
12. While polling is happening, the widget shows a visible refresh indicator.


6. WHY POLLING WAS USED

Polling was added so the weather widget can stay current after the page has already loaded.

Without polling, the weather information would only be fetched once when the user opens the app. With polling, the temperature and weather condition can update automatically every 30 seconds.

This makes the feature more dynamic and better demonstrates live frontend behavior.


7. WHY LOCATION IS NOT RE-FETCHED EVERY TIME

The location label is fetched only once after the first successful weather load.

This decision was made for two reasons:

1. The user’s place name does not usually change while they are using the page.
2. Re-fetching the location label every 30 seconds would create unnecessary backend and reverse-geocoding requests.

Because of this, the implementation refreshes only the weather data during polling while preserving the existing location label.


8. USER INTERFACE BEHAVIOR

The weather widget has multiple UI states:

INITIAL LOADING STATE

When the widget first loads, it shows a loading message so the user can see that the app is trying to get live weather data.

Example:

```
Loading live weather...
```

READY STATE

When the request succeeds, the widget shows:

- weather icon
- temperature
- weather description
- humidity
- location label
- live polling status badge

Example:

```
[cloud icon] 33 C Drizzle | [droplet icon] 57% | [thermometer icon] Taguig | 30s live
```

POLLING REFRESH STATE

When the 30-second refresh runs, the widget shows a visible status indicator so users can tell that the live update is happening.

Example:

```
Refreshing
```

ERROR OR FALLBACK STATE

If location access is denied or unavailable, the widget does not break the page. Instead, it shows a fallback message.

Examples:

```
Enable location to see weather
```

```
Location blocked. Turn it on to see weather.
```


9. MOBILE AND DESKTOP DISPLAY

The weather widget is designed to stay inside the top bar on both desktop and mobile layouts.

On desktop, the full weather information is visible with separators and icons.

On mobile, the same information is preserved but the spacing and sizes are reduced so the widget can remain on a single row inside the top bar.

This keeps the mobile widget visually consistent with the desktop version while still fitting inside the smaller header space.


10. MAIN FRONTEND LOGIC USED

The implementation is based on React hooks.

The component uses:

- useState for widget state
- useEffect for the initial fetch and interval lifecycle
- useRef for preserving the location label between polling cycles

Important responsibilities in the component:

1. Request permission from the browser
2. Fetch weather data
3. Fetch location label once
4. Save the weather state
5. Start a 30-second interval
6. Clear the interval on unmount


11. EXAMPLE OF THE POLLING IDEA

The general polling logic works like this:

```
Load component
Request geolocation
Fetch weather
Fetch location label once
Render widget
Start 30-second interval
Refresh only weather every 30 seconds
Stop interval when component unmounts
```


12. ERROR HANDLING

The widget includes fallback behavior so it does not crash the UI.

Handled cases include:

1. Browser does not support geolocation
2. User denies location permission
3. Weather API request fails
4. Weather data response is incomplete
5. Component unmounts while requests are still in progress

This makes the widget safer and more stable inside the application layout.


13. BENEFITS OF THE IMPLEMENTATION

This implementation improves the project in several ways:

1. Replaces placeholder weather data with live data
2. Makes the top bar more interactive and realistic
3. Demonstrates frontend API integration
4. Demonstrates browser geolocation usage
5. Demonstrates real-time polling behavior
6. Preserves performance by avoiding repeated location lookups
7. Keeps the UI responsive with visible loading and refresh states


14. LIMITATIONS

The feature still depends on user permission for location access.

If the user blocks location access, the app cannot show local weather and must remain in the fallback state.

The widget also depends on network availability and the external weather API being reachable.


15. TESTING AND VERIFICATION

The feature should be verified using the following checks:

1. Open the app and confirm the browser asks for location permission.
2. Allow location access and confirm the widget shows real weather data.
3. Confirm the location label appears after the first successful load.
4. Wait at least 30 seconds and verify that the widget refreshes automatically.
5. Confirm the refresh indicator appears during polling.
6. Confirm the location label is retained during later weather refreshes.
7. Deny location permission and confirm the fallback message appears.
8. Confirm the top bar layout remains stable on both desktop and mobile view.


16. CONCLUSION

The weather widget in the MindScope top bar is now a live, location-aware, polling-based UI feature.

It fetches real weather data, shows the user’s location, updates automatically every 30 seconds, and includes visible loading and refreshing states so the live behavior can be demonstrated clearly.

This makes the feature more practical, more realistic, and easier to present as an implemented frontend capability.
