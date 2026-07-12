# TransitOps 🚌

**TransitOps** is a comprehensive, AI-powered Fleet & Transit Management Platform built for modern transportation and logistics companies. It streamlines the management of vehicles, drivers, trips, fuel consumption, and vehicle maintenance, all guarded by a robust Role-Based Access Control (RBAC) system.

Built as a full-stack monorepo with **Next.js (React)**, **Node.js (Express)**, and **MongoDB**, this project is highly scalable, modular, and designed to drastically reduce operational friction.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**
   - Granular permissions for **Admins, Fleet Managers, Dispatchers, Safety Officers, and Financial Analysts**.
   - Admins have full CRUD control, whereas Dispatchers can only manage Trips and Drivers, and Financial Analysts can only view Expenses/Fuel.
2. **Vehicle & Driver Management**
   - Track vehicle lifecycles, specifications, status (Available, On Trip, In Maintenance), and current odometer readings.
   - Manage drivers, their license details, and their availability.
3. **Trip Dispatching System**
   - Create draft trips, assign available drivers and vehicles, and dispatch them.
   - Track real-time status (Draft -> Dispatched -> In Progress -> Completed/Cancelled).
4. **Maintenance & Fuel Logs**
   - Schedule routine maintenance, track labor and parts costs.
   - Log fuel fill-ups to automatically calculate fuel efficiency metrics (MPG/KPL).
5. **System-Wide Notifications**
   - Automated, role-targeted notification system. (e.g., A Safety Officer is immediately notified when a vehicle is sent for maintenance).
6. **Data Export & Analytics**
   - Generate multi-sheet Excel reports detailing Vehicle ROI, Fuel Efficiency, and Financial Summaries.
7. **AI Fleet Assistant**
   - Integrated with Google Gemini AI to answer operational questions, provide insights on data anomalies, and assist in daily decision-making.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), React, Tailwind CSS, Zustand (State Management), React Query, Lucide Icons, Headless UI.
- **Backend:** Node.js, Express.js, Mongoose (MongoDB).
- **Authentication:** JWT (Access & Refresh tokens).
- **AI Integration:** Google Gemini API.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on port 27017 or via MongoDB Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd transitops
   ```

2. **Install Dependencies:**
   - **Backend:**
     ```bash
     cd server
     npm install
     ```
   - **Frontend:**
     ```bash
     cd client
     npm install
     ```

3. **Environment Setup:**
   Copy the provided template environments to set up your local keys.
   ```bash
   # In the root folder or server folder:
   cp .env.test .env
   ```
   *Make sure to fill in your `GEMINI_API_KEY` inside `.env`.*

4. **Seed the Database (Optional but recommended):**
   ```bash
   cd server
   npm run seed
   ```
   *This will create the default Admin account defined in your `.env` file.*

5. **Run the Application:**
   Start the backend:
   ```bash
   cd server
   npm run dev
   ```
   Start the frontend:
   ```bash
   cd client
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Default Credentials (Seeded)
If you ran the seed script using the `.env.test` templates:
- **Email:** `admin@transitops.com`
- **Password:** `AdminPassword123!`

---

## 🏆 Hackathon Context

This project was developed with rapid iteration and scalability in mind. It cleanly separates concerns between the RESTful Express API and the modern Next.js client, making it extremely easy to extend. The integration of AI for predictive intelligence transforms it from a simple CRUD dashboard into an intelligent operational assistant.
