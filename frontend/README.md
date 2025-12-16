# SkillBridge Frontend

React frontend for the SkillBridge Employee Skill Matrix & Learning Recommender.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Charts and visualizations

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8080/api`

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` if your backend runs on a different URL.

3. **Run development server**:
   ```bash
   npm run dev
   ```
   
   Frontend will start on `http://localhost:5173`

4. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/            # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── MySkills.jsx
│   │   └── MyGaps.jsx
│   ├── services/         # API services
│   │   └── api.js
│   ├── context/          # React contexts
│   │   └── AuthContext.jsx
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── .env.example          # Environment variables template
└── package.json
```

## Features

### Implemented ✅
- **Authentication** - Login with JWT
- **Dashboard** - Role-based navigation
- **My Skills** - View and manage employee skills
- **Gap Analysis** - Compare skills vs roles/projects
- **Recommendations** - Get learning suggestions

### To Be Implemented ⏳
- Manager pages (Team Matrix, Roles/Projects)
- HR Admin pages (Skill Catalog, Resources)
- Charts and visualizations
- Advanced filtering and search

## Test Accounts

```
Employee: employee@skillbridge.com / employee123
Manager:  manager@skillbridge.com / manager123
HR Admin: admin@skillbridge.com / admin123
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend connects to the backend API at `http://localhost:8080/api` by default.

All API calls are configured in `src/services/api.js` with:
- Automatic JWT token injection
- Error handling and 401 redirects
- Request/response interceptors

## Development

1. Make sure the backend is running first
2. Start the frontend dev server
3. Login with a test account
4. Navigate through the application

## Deployment

Build the production bundle:
```bash
npm run build
```

The `dist/` folder can be deployed to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static hosting service

## License

Internal use only.
