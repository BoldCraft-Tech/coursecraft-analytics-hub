
# Rural Skills Learning API

This is a NestJS backend API for the Rural Skills Learning Platform. It provides all the necessary endpoints for courses, lessons, enrollments, certificates, and user management.

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Create and apply database migrations
npm run prisma:migrate

# Seed the database (optional)
# Add seeding script to package.json if needed
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## API Documentation

After starting the application, you can access the Swagger API documentation at:

```
http://localhost:3000/api
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
JWT_SECRET="your-secret-key-here"
```

## Features

- 🔐 Authentication with JWT
- 👩‍💻 User management
- 📚 Course management
- 📖 Lesson management
- 🎓 Enrollment tracking
- 🏆 Certificate generation
- 🔎 Course recommendations

## Database Schema

The application uses PostgreSQL with Prisma ORM. The schema includes:

- Users
- Courses
- Lessons
- Enrollments
- Certificates
- User Lesson Progress

## Main Endpoints

- **Auth:** `/auth/register`, `/auth/login`, `/auth/profile`
- **Users:** `/users`, `/users/:id`
- **Courses:** `/courses`, `/courses/:id`, `/courses/recommendations`
- **Lessons:** `/lessons/:id`, `/lessons/:id/progress`
- **Enrollments:** `/enrollments`, `/enrollments/user/:userId`
- **Certificates:** `/certificates/generate`, `/certificates/user/:userId`

## License

This project is licensed under the MIT License
