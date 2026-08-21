# Store Rating Portal

A full-stack web application developed for a Full Stack Intern Coding Challenge.

The application allows users to browse registered stores and submit or modify ratings from 1 to 5 stars. A single login system is used for all users, with different access levels based on their roles.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router DOM
- Bootstrap 3.4
- Lucide React

### Backend

- Node.js
- Express.js
- TypeScript
- REST API

### Database

- PostgreSQL
- `pg` connection pool

### Authentication & Security

- JWT authentication
- bcrypt password hashing
- Role-Based Access Control (RBAC)
- Parameterized PostgreSQL queries
- Server-side validation

## User Roles

### System Administrator

- View total users, stores and submitted ratings
- Add stores
- Add normal users and admin users
- View users and stores
- Search, filter and sort listings
- View user details
- View store owner rating information
- Logout

### Normal User

- Sign up and login
- View registered stores
- Search stores by name and address
- View overall store ratings
- View their own submitted rating
- Submit ratings from 1 to 5 stars
- Modify previously submitted ratings
- Change password
- Logout

### Store Owner

- Login through the common authentication system
- View the average rating of their store
- View users who submitted ratings for their store
- View rating details
- Change password
- Logout

## Validation Rules

- **Name:** 20 to 60 characters
- **Address:** Maximum 400 characters
- **Password:** 8 to 16 characters, at least one uppercase letter and one special character
- **Email:** Standard email validation
- **Rating:** Integer value from 1 to 5

## Authentication & Security

- JWT is used for authenticated API requests.
- Passwords are hashed using bcrypt before being stored.
- Role-based authorization protects restricted routes.
- Store Owner access is restricted to their own store.
- User identity for rating operations is taken from the authenticated JWT.
- PostgreSQL queries use parameterized inputs.
- Sorting fields are validated using whitelists.
- Passwords are not returned in normal API responses.
- Sensitive configuration is stored in environment variables.

## Database

The application uses PostgreSQL for persistent data storage.

The main entities are:

- Users
- Stores
- Ratings

A user can submit one rating for a particular store and can modify that rating later.

The database uses relationships, constraints and parameterized queries to maintain data integrity and security.

## Project Structure

```text
store-rating-system/
│
├── backend/
│   ├── middleware/
│   ├── routes/
│   ├── sql/
│   ├── db.ts
│   ├── postgres.ts
│   ├── server.ts
│   └── types.ts
│
├── public/
│
├── src/
│   ├── components/
│   ├── api.ts
│   ├── storage.ts
│   ├── types.ts
│   ├── validation.ts
│   ├── index.css
│   └── index.tsx
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md

## Getting Started

### Prerequisites

- Node.js
- npm
- PostgreSQL

### 1. Clone the Repository

```bash
git clone https://github.com/chetanpatil2351/store-rating-system.git
cd store-rating-system

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root using `.env.example` as a reference.

Example:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
```

Do not commit the `.env` file to GitHub.

### 4. Run the Application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 5. Check Database Connection

Open:

```text
http://localhost:3000/api/health
```

A successful response should contain:

```json
{
  "status": "ok",
  "database": "connected"
}
```

### 6. Run TypeScript Validation

```bash
npm run lint
```

### 7. Create Production Build

```bash
npm run build
```

### 8. Start Production Server

```bash
npm start
```

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login for all roles |
| POST | `/api/auth/register` | Public | Normal user registration |
| POST | `/api/auth/change-password` | Authenticated | Change password |
| GET | `/api/users` | Admin | List users |
| GET | `/api/users/:id` | Authenticated | View user details |
| POST | `/api/users` | Admin | Create user |
| GET | `/api/stores` | Authenticated | List stores |
| POST | `/api/stores` | Admin | Create store |
| GET | `/api/ratings` | Authenticated | View ratings |
| POST | `/api/ratings` | Normal User | Submit or modify rating |
| GET | `/api/stats` | Admin | Dashboard statistics |

## Development Practices

The project follows basic full-stack development practices including:

- Separation of frontend and backend responsibilities
- Reusable React components
- REST API based communication
- Server-side validation
- JWT-based authentication
- Role-based authorization
- PostgreSQL data persistence
- Parameterized database queries
- Environment-based configuration

## Author

**Chetan Patil**

B.Tech Computer Science

Full Stack Developer
