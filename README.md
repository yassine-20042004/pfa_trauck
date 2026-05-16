# TR-A-UCKER (TrAuck) Logistics Platform

Welcome to the **TrAuck** repository! TrAuck is a comprehensive, full-stack logistics platform designed to streamline tracking, delivery management, and real-time mapping for the logistics industry.

## 🚀 Project Overview

The project is structured into two main parts:
- **Backend**: A robust REST API built with .NET Core and C# using Clean Architecture principles.
- **Frontend**: A modern, highly responsive web application built with React, TypeScript, and Vite.

### Key Features
- 📍 **Real-time Tracking**: Interactive map-based dashboard utilizing Leaflet and React-Leaflet.
- 🔐 **Authentication**: Role-based authentication flow for different user types (Admin, Driver, User).
- ⚡ **Live Updates**: Real-time communication via SignalR.
- 🎨 **Modern UI/UX**: Sleek, fully responsive design powered by Tailwind CSS, Radix UI, and Framer Motion.

---

## 🛠️ Technology Stack

### Backend (.NET Core)
- **Framework**: .NET 8 / ASP.NET Core Web API
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, API)
- **Real-time**: SignalR
- **Testing**: xUnit / NUnit (TrAuck.Tests)

### Frontend (React + Vite)
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Class Variance Authority (CVA) + clsx
- **State Management**: Zustand
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Maps**: Leaflet + React-Leaflet

---

## 💻 How to Run the Project Perfectly

### Prerequisites
Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [.NET SDK](https://dotnet.microsoft.com/download) (v8.0 or corresponding version)
- A Code Editor (e.g., Visual Studio, Visual Studio Code, or Rider)

### 1. Setting up the Backend

1. Navigate to the root directory of the project.
2. Restore the dependencies:
   ```bash
   dotnet restore TrAuck.Backend.sln
   ```
3. (Optional) Apply any pending database migrations if Entity Framework Core is used:
   ```bash
   dotnet ef database update --project TrAuck.Infrastructure --startup-project TrAuck.Api
   ```
4. Run the API project:
   ```bash
   dotnet run --project TrAuck.Api/TrAuck.Api.csproj
   ```
   *The backend should now be running (usually on `https://localhost:5001` or `http://localhost:5000`). Check the console for the exact URL.*

### 2. Setting up the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd TrAuck.Frontend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend should now be running. The Vite console will provide the local URL (usually `http://localhost:5173`).*

---

## 🤝 Contribution Guidelines

1. Fork the repository.
2. Create a new branch for your feature or bugfix (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m "Add new feature"`).
4. Push to the branch (`git push origin feature-name`).
5. Open a Pull Request.

## 📝 License

This project is proprietary and intended for the PFA (Projet de Fin d'Année) demonstration.
