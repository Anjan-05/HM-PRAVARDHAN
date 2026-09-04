# HM Pravardhan — Frontend Architecture

This directory houses the client application for **HM Pravardhan**.

---

## Directory Organization

```
frontend/ (and root src/)
├── src/
│   ├── components/
│   │   ├── common/       # Navbar, Footer, Notifications, Modals
│   │   ├── hm/           # Headmaster Dashboard, History, Performance Graph, Student Manager
│   │   ├── meo/          # Mandal Education Officer Dashboard & School Inspections
│   │   ├── deo/          # District Education Officer Dashboard & Verification
│   │   ├── public/       # Public State Rankings, Search, HM Profiles, Activity Feed
│   │   └── auth/         # Login Modal, Role switcher, Session handling
│   ├── context/          # AuthContext and state management
│   ├── api.ts            # Client HTTP API connector
│   ├── types.ts          # Shared client TypeScript types
│   ├── App.tsx           # Primary routing and active tab coordinator
│   └── main.tsx          # Application entry point
├── public/               # Static assets, institutional icons
└── package.json
```

## User Roles & Views

1. **Visitor**: Read-only public transparency view with search, state rankings, and school profiles.
2. **Headmaster**: Full institutional evaluation dashboard, Class 10 marks entry, achievement submissions, and complaints.
3. **MEO**: Mandal-wide inspection reviews, school monitoring, and score verifications.
4. **DEO**: District-wide analytics, final achievement bonus verification, and score appeal resolutions.
