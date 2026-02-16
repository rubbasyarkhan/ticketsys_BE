# Professional Ticketing System Backend

A production-ready microservice for handling support tickets, featuring JWT authentication, role-based access control (RBAC), and automated email notifications.

## 🚀 Features

- **Clean Architecture:** Scalable folder structure and modular design.
- **Ticket ID Generation:** Atomic sequence-based IDs (e.g., `TCK-2026-000001`).
- **Activity Logging:** Full audit trail for every ticket action.
- **RBAC:** Differentiated access for Admins and Agents.
- **Email Service:** Automated templates for creation, replies, and resolution.
- **Performance Tracking:** MongoDB aggregation for agent statistics.
- **Security:** Helmet, CORS, Rate Limiting, and Zod validation.

## 🛠 Tech Stack

- **Node.js** & **Express**
- **MongoDB** & **Mongoose**
- **JWT** (JSON Web Tokens)
- **Nodemailer**
- **Zod** (Validation)

## 📦 Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` (refer to `.env.example`).
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🔌 API Endpoints

### Auth

- `POST /api/auth/login` - Agent Login
- `POST /api/auth/register` - Register new Agent (Admin only)
- `GET /api/auth/me` - Get current agent details

### Tickets

- `POST /api/tickets` - Create a ticket (Public/LMS)
- `GET /api/tickets` - List tickets (Pagination & Filters)
- `GET /api/tickets/:id` - Get ticket details
- `PATCH /api/tickets/:id/assign` - Assign to agent (Admin only)
- `PATCH /api/tickets/:id/status` - Change status
- `POST /api/tickets/:id/reply` - Add agent reply
- `POST /api/tickets/:id/internal-note` - Add internal note

### Admin

- `GET /api/admin/agent-stats` - View agent performance metrics

## 🛡 Security Measures

- **Rate Limiting:** Applied to public ticket creation to prevent spam.
- **Data Validation:** Zod schemas ensure input integrity.
- **Password Hashing:** Bcrypt for secure storage.
- **Sanitization:** Prevent NoSQL injection and XSS via middleware.

---

Built with ❤️ for scalability and reliability.
