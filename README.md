# Runway — Personal Flight Companion (PWA)

A private, mobile-first flight journal and airport quick-reference app. This is an original implementation, not a copy of Flighty's proprietary UI or assets.

## Included
- iPhone-friendly responsive interface and installable PWA shell
- Local flight journal: add/edit/delete records, filter upcoming/completed, flight stats
- Built-in quick-reference guide for 16 major airports, local time, traveler notes
- CSV import for previous flights (flight number, origin, destination, date, airline, miles/distance, status; common header variants supported)
- JSON export/import backup
- Optional Aviationstack flight lookup integration
- Offline app shell via service worker
- Sample entries for preview (clearly labeled and excluded from your real stats/exports)

## Important limits
- Flight records are stored in this browser's local storage. They do not automatically sync to other devices. Clearing browser website data can remove them; export backups regularly.
- The airport guide is a static quick reference. It does not provide live airport wait times, gate changes, disruption alerts, or authoritative transfer advice.
- Live lookup is optional and uses the Aviationstack API from the browser. You need your own provider key. The key is stored in local storage and included in requests from your device, so this is suitable for personal use, not a public deployment. Browser CORS and provider plan limitations may prevent requests from working.
- This first version does not implement background push alerts, continuous aircraft-position maps, reliable delay predictions, automatic calendar/email import, or full airline schedule coverage.
- Do not use this app as the sole source for operational flight decisions. Verify status and gates with your airline/airport.

## API cost notes (checked October 2026)
Aviationstack currently advertises a free personal-use plan with 100 requests/month. Its paid Basic plan is listed at $49.99/month or $44.99/month billed yearly, with more requests and additional data features. Plans and terms can change; check the provider's pricing page before signing up:
https://aviationstack.com/pricing

OpenSky provides aircraft position data, but its terms say operational REST API use requires prior written agreement, and it does not provide commercial schedules/delays. This project therefore does not call OpenSky:
https://opensky-network.org/about/terms-of-use
https://opensky-network.org/about/faq

## Run locally on your computer
PWA install/service worker features need localhost or HTTPS. From this directory run:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser on the same computer.

## Put it on your iPhone
For easiest installation, host this folder on a private HTTPS site you control (for example a private GitHub repository deployed with GitHub Pages, or another static HTTPS host). Then open the HTTPS URL in Safari:
1. Tap Share.
2. Tap Add to Home Screen.
3. Open Runway from the new Home Screen icon.

A PWA served from your computer's localhost is not automatically available on the iPhone. To use it on the phone, the files must be served to the phone over a reachable HTTPS URL. If you use GitHub Pages, remember that a public repository/site may expose source code; do not put personal flight data or API secrets in the source files. The API key is entered inside the app, not hardcoded into the project.

## Data backup
Tap Export to download `runway-flight-backup.json`. Use Backup & restore to import either that JSON file or a CSV export. CSV headers are matched flexibly; recommended columns are `flight,origin,destination,date,airline,miles,status`. Airport codes are preferred for origin/destination. Dates in `YYYY-MM-DD` are safest; slash dates are interpreted as US month/day/year unless the first number exceeds 12. Invalid rows are skipped. Export excludes sample flights and the API key.
