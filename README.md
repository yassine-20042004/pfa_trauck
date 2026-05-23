<div align="center">
  
# 🚚 TrAuck Logistics Platform

**A Modern, Full-Stack Fleet & Logistics Management System**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![.NET 8](https://img.shields.io/badge/.NET_8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.com/)

</div>

<br />

TrAuck is a premium, high-performance logistics and fleet management platform. It features a sleek, dark-mode user interface powered by React and Tailwind CSS, backed by a robust Domain-Driven Design (DDD) .NET 8 Web API utilizing CQRS, MediatR, and Supabase PostgreSQL.

---

## 📸 Screenshots

*(Replace the placeholder image URLs below with actual screenshots of your app by placing them in a `docs/` or `assets/` folder)*

### 1. Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x450/18181b/ffffff?text=Admin+Dashboard+Screenshot)

### 2. Live Driver Route
![Driver Route](https://via.placeholder.com/800x450/18181b/ffffff?text=Live+Driver+Route+Screenshot)

### 3. Registration & Access Requests
![Registration Flow](https://via.placeholder.com/800x450/18181b/ffffff?text=Registration+Flow+Screenshot)

---

## ✨ Key Features

- **🛡️ Secure Access Flow**: Users (Drivers & Dispatchers) request access via a dynamic registration portal. Admins approve requests and manage users.
- **🚚 Fleet & Vehicle Management**: Full tracking of trucks, vans, flatbeds, and refrigerated vehicles.
- **📍 Live Route Tracking & Dispatching**: Dynamic map UI for visualizing Dijkstra/Bellman-Ford routing algorithms, synced directly to the .NET backend API.
- **📦 Load Planning**: Advanced cargo item tracking and delivery stop management.
- **⚙️ Clean Architecture**: The .NET backend is strictly divided into `Domain`, `Application`, `Infrastructure`, and `Api` layers.
- **⚡ CQRS Pattern**: Utilizes MediatR for clean, separated Commands and Queries.
- **🔒 Secure Authentication**: Integrated BCrypt password hashing and user roles.

---

## 🛠️ Technology Stack

### Frontend
- **React 18** (Vite)
- **TypeScript**
- **Tailwind CSS** (Custom Dark Theme, Glassmorphism, Animations)
- **Framer Motion** (Micro-animations and Page Transitions)
- **React Router v6**
- **Lucide React** (Icons)
- **shadcn/ui** (Component primitives)

### Backend
- **.NET 8 Web API**
- **C# 12**
- **Entity Framework Core 8** (Code-First Migrations)
- **MediatR** (CQRS Pattern)
- **Supabase** (PostgreSQL Database Hosting)
- **BCrypt.Net-Next** (Password Hashing)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- A [Supabase](https://supabase.com/) account and project (for PostgreSQL).

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/TrAuck.git
cd TrAuck
```

### 2. Backend Setup
1. Navigate to the API folder:
   ```bash
   cd TrAuck.Api
   ```
2. Configure your Supabase Connection String in `appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "SupabaseConnection": "Host=aws-0-eu-central-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.your_project;Password=YOUR_PASSWORD"
     }
   }
   ```
3. Run Entity Framework Migrations to create the database schema:
   ```bash
   dotnet ef database update --project ../TrAuck.Infrastructure --startup-project .
   ```
   *(Note: This automatically seeds a default admin user: `admin@admin.com` / `admin123`)*
4. Run the API:
   ```bash
   dotnet run
   ```
   The API will be available at `http://localhost:5198`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd pfa_trauck/TrAuck.Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`.

---

## 👨‍💻 Default Credentials

Upon running the first database migration, the following admin user is seeded:

- **Email**: `admin@admin.com`
- **Password**: `admin123`
- **Role**: `Admin`

---

## 🏗️ Project Structure

```text
TrAuck/
├── TrAuck.Frontend/           # React SPA (Vite + Tailwind)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── features/          # Vertical slices (admin, auth, driver, landing)
│   │   └── App.tsx            # Main router
├── TrAuck.Api/                # .NET 8 Web API Entry Point
│   ├── Controllers/           # REST Endpoints
│   └── appsettings.json
├── TrAuck.Application/        # CQRS Handlers, Interfaces (Business Logic)
│   ├── Features/              # MediatR Commands/Queries per domain entity
├── TrAuck.Domain/             # Domain Models (Entities, Aggregates)
│   └── Aggregates/            # Users, Vehicles, Trips, Loads
└── TrAuck.Infrastructure/     # EF Core, DbContext, Migrations
```

---

## 📄 License
This project is proprietary and built for logistics management.

<div align="center">
  <i>Built with ❤️ using React & .NET 8</i>
</div>
