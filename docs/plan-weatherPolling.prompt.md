## Plan: 30-second weather polling

Refresh only the live weather data in the top bar every 30 seconds, while keeping the location label from the first successful reverse-geocode lookup. This keeps the widget current without repeatedly hitting the location service.

**Steps**
1. Update the weather effect in `frontend/src/components/Topbar.tsx` to extract the existing fetch logic into a reusable async function inside the component.
2. Run that fetch immediately on mount, then start a `setInterval` for 30,000 ms that re-runs only the weather request path. *Depends on 1*
3. Preserve the location label after the first successful reverse-geocode response so polling does not re-request it every cycle. *Depends on 1*
4. Add cleanup in the effect return so both the interval and any in-flight updates are cancelled on unmount. *Depends on 2*
5. Keep the existing permission-denied and unavailable handling intact so polling does not change the fallback UI. *Depends on 1-4*

**Relevant files**
- `c:/Mycodes/MindScope/frontend/src/components/Topbar.tsx` — the weather effect and widget rendering live here today.
- `c:/Mycodes/MindScope/backend/routes/weather.js` — no change needed unless you later want a backend-side weather proxy.

**Verification**
1. Re-open the component logic and confirm the interval is cleared in the effect cleanup.
2. Test the widget in the browser and confirm the temperature/condition updates every 30 seconds without losing the location label.
3. Run the frontend type/lint check for the touched file if available in the project scripts.

**Decision**
- Poll weather only, not location. This reduces repeat network calls and avoids unnecessary reverse-geocode traffic.
