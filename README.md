# Lumen

**Illuminate Every Idea.** Discover inspiring talks and ideas.

Lumen is a full-stack web application that aggregates and showcases the latest TED Talks. The backend periodically syncs videos from a YouTube channel feed into MongoDB, and the frontend displays them as a clean, browsable grid of talk cards — with a dedicated detail page for each talk.

## Features

- Automatic syncing of the latest talks from a YouTube channel feed (defaults to TED's official channel)
- Periodic background refresh (every 15 minutes) to keep talks up to date
- REST API to fetch the latest talks, look up a specific talk by video ID, or find related talks
- Persistent storage in MongoDB with duplicate-safe upserts
- Responsive React frontend with skeleton loading states and error handling
- Talk detail page with an embedded YouTube player and a "Related Talks" section
- Dark / Light / Auto theme toggle (auto follows system preference, with FontAwesome icons)
- Retry-with-backoff logic for resilient feed fetching

## Tech Stack

**Frontend:** React 19, Vite, React Router

**Backend:** Node.js, Express, Mongoose

**Database:** MongoDB

**Other Tools:**

- rss-parser — YouTube feed parsing
- FontAwesome — theme toggle icons
- CORS — Cross-origin request handling
- dotenv — Environment variable management
- nodemon — Development auto-restart
- oxlint — Frontend linting

## Project Structure

```
Lumen-web/
├── Backend/
│   ├── models/          # Mongoose schemas (Talk)
│   ├── routes/           # Express API routes
│   ├── utils/             # DB connection & feed sync logic
│   └── server.js          # App entry point
└── Frontend/
    ├── src/
    │   ├── api/            # API request helpers
    │   ├── components/     # React components (TalkCard, TalkCardSkeleton, ThemeToggle)
    │   ├── hooks/           # Custom hooks (useTheme)
    │   ├── pages/            # Route-level pages (Home, TalkDetail)
    │   └── App.jsx            # Root component & router
    └── index.html
```

## API Endpoints

| Method | Endpoint                        | Description                                    |
| ------ | -------------------------------- | ----------------------------------------------- |
| GET    | `/api/talks/latest?limit=`       | Fetch the most recent talks (max 50)            |
| GET    | `/api/talks/:videoId`            | Fetch a single talk by video ID                 |
| GET    | `/api/talks/:videoId/related`    | Fetch up to 6 talks related to the given talk   |

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- MongoDB Atlas account (or a local MongoDB instance)

### Backend Setup

```
cd Backend
npm install
```

Create a `.env` file inside `Backend/` with:

```
MONGODB_URI=your_mongodb_connection_string
YOUTUBE_CHANNEL_ID=your_youtube_channel_id   # optional, defaults to TED's channel
```

Start the backend:

```
npm start
```

The server will run on `http://localhost:8080`.

### Frontend Setup

```
cd Frontend
npm install
npm run dev
```

The frontend will run on Vite's default port and expects the backend to be available at `http://localhost:8080`.

## License

This project is intended for educational and portfolio purposes.
