# Atmos — Weather Forecast

A responsive weather website built with plain HTML, CSS, and JavaScript. Uses OpenWeather Geocoding, Current Weather, and 5 Day / 3 Hour Forecast APIs.

## Run

Serve `dist` with any static server, for example `python -m http.server 5173 --directory dist`, then open http://localhost:5173.

Open API settings and enter an OpenWeather API key. It stays in tab memory only. The initial screen uses labeled sample data. No live weather can be retrieved without a valid key; new keys may need activation time.

Features: city search, geolocation, Celsius/Fahrenheit toggle, current conditions, next eight 3-hour forecasts, five-day summaries, local sunrise/sunset, loading and error states, responsive layout.

Forecast daily ranges summarize the intervals returned by OpenWeather, so the final day may be partial. Frontend API keys are visible in browser requests; use a backend proxy for a shared production credential.

API references: https://openweathermap.org/api/current and https://openweathermap.org/forecast5
