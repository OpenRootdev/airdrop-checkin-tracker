# Airdrop Check-in Tracker

A simple daily check-in checklist for airdrop projects — with streaks.
No account, no server: all data stays in your browser (localStorage).

## Features

- Daily checklist of airdrop projects (14 defaults included)
- Streak counter per project (consecutive days, computed from check-in history)
- Daily progress summary ("X/14 done today")
- Add your own projects (name + optional link), delete any project
- Restore the default project list
- Bilingual UI: Bahasa Indonesia / English (toggle in the header)
- Mobile-first, dark theme, zero dependencies — plain HTML/CSS/JS

## How to use

1. Open `index.html` in any modern browser, or enable GitHub Pages for this repo.
2. Tap the circle next to a project to check it in for today. Tap again to undo.
3. Streaks grow when you check in on consecutive days. A missed day resets that project's streak.
4. Add new projects with the form at the top. Project names link out when a URL is set.

## Data & privacy

- Everything is stored in `localStorage` under the key `airdrop-checkin-tracker-v1`.
- Nothing leaves your device. Clearing browser data erases your check-ins.
- "Erase all data" in the app wipes the tracker back to its defaults.

## Default projects

TrendBTC, Thor, Ryfinite, Loqua, MineGrey, Upshot, Deadstock, 9Chain,
Lake Energy, Neova, Desea, Gleam XON, Polyester, Pear Trade.

## Roadmap

- Reminder / notification for unchecked projects
- Weekly summary view
- Export & import backup (JSON)
- Optional cloud sync (opt-in)

## Contributing

Issues and pull requests are welcome. Keep it dependency-free and mobile-friendly.

## License

Free to use and modify.
