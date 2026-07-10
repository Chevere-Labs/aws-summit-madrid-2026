# Conference Session Planner

Multi-city session planner for AWS Summit conferences. Explore and organize sessions with search, filters, calendar/grid views, and favorites.

## Demo

[https://chevere-labs.github.io/conference-session-planner/](https://chevere-labs.github.io/conference-session-planner/)

## Features

| Feature | Description |
|---------|-------------|
| **City Selector** | Switch between supported cities (Bogotá, Madrid) |
| **Search** | Real-time search by title, description, speaker, room, or session code |
| **Filters** | 10 combinable filters: Type, Level, Room, Time, Industry, Role, AWS Service, Area of Interest, Speaker, Features |
| **Favorites** | Mark sessions as favorites — stored per-city in localStorage |
| **Calendar** | Time × room matrix with start/end times and scroll indicators |
| **Grid** | Card view with quick info for each session |
| **Detail** | Modal with full description, speakers, tags, and metadata |
| **Dark Theme** | Dark UI optimized for long exploration sessions |

## Stack

- **React 19** + **TypeScript**
- **Vite 8** (build tool)
- **gh-pages** (deploy)

## Development

```bash
# Install dependencies
cd summit-planner && npm install

# Start dev server
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

## Project Structure

```
summit-planner/
├── src/
│   ├── components/        # React components
│   │   ├── SearchBar.tsx
│   │   ├── FilterBar.tsx
│   │   ├── TalkCard.tsx
│   │   ├── TalkGrid.tsx
│   │   ├── TalkDetail.tsx
│   │   ├── CalendarView.tsx
│   │   ├── StatsBar.tsx
│   │   └── CitySelector.tsx
│   ├── hooks/
│   │   └── useFavorites.tsx   # Favorites context + localStorage
│   ├── data/
│   │   ├── cities.json           # City configurations
│   │   ├── bogota-sessions.json  # Bogotá session data
│   │   └── madrid-sessions.json  # Madrid session data
│   ├── types.ts
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── scripts/
│   ├── fetch-sessions.mjs  # Transform raw API responses
│   └── README.md
├── public/
├── index.html
├── package.json
└── vite.config.ts
```

## Adding a New City

1. Capture raw session data from the AWS Events API
2. Run the transformation script:
   ```bash
   node scripts/fetch-sessions.mjs <raw-response.json> --timezone "America/New_York" --output src/data/newcity-sessions.json
   ```
3. Add the city configuration to `src/data/cities.json`:
   ```json
   {
     "id": "newcity",
     "name": "AWS Summit New City 2026",
     "sessionsFile": "newcity-sessions.json",
     "timezone": "America/New_York",
     "date": "2026-XX-XX",
     "roomCategories": {
       "Category Name": ["Keyword1", "Keyword2"]
     }
   }
   ```
4. Import the sessions in `src/App.tsx` and add to `sessionsByCity`

## Deploy

```bash
cd summit-planner
npm run deploy
```

Builds and publishes the `dist/` folder to the `gh-pages` branch.

## Data

Session data is obtained from the official **AWS Events** API (`prod-api.awseventservices.com`). Data includes schedules, rooms, speakers, descriptions, levels, industries, AWS services, and areas of interest.

## Built with

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [mitmproxy](https://mitmproxy.org/) (for data capture)
