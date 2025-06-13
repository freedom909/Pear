# Pear API

RESTful API for the Pear application built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **User Management**: User registration, profile management, and role-based access control
- **Data Validation**: Request validation using express-validator
- **Error Handling**: Centralized error handling with custom error classes
- **Logging**: Advanced logging with Winston
- **Security**: Implementation of security best practices with Helmet
- **Database**: MongoDB integration with Mongoose ODM
- **Testing**: Unit and integration tests with Jest
- **Documentation**: API documentation with Swagger/OpenAPI
- **Code Quality**: ESLint, Prettier, and Husky for code quality and consistency

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pear-api.git
   cd pear-api
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your configuration.

4. Build the project:
   ```bash
   npm run build
   # or
   yarn build
   ```

## Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
```

### Production Mode

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Users

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `DELETE /api/users/me` - Delete current user account
- `PUT /api/users/me/password` - Change current user password
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/:id` - Update user by ID (Admin only)
- `DELETE /api/users/:id` - Delete user by ID (Admin only)

## Testing

```bash
# Run all tests
npm test
# or
yarn test

# Run tests in watch mode
npm run test:watch
# or
yarn test:watch
```

## Code Quality

```bash
# Run linter
npm run lint
# or
yarn lint

# Format code
npm run format
# or
yarn format
```

## Project Structure

```
src/
├── config/             # Configuration files
├── controllers/        # Request handlers
├── middlewares/        # Express middlewares
├── models/             # Mongoose models
├── routes/             # API routes
├── services/           # Business logic
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── validations/        # Request validation schemas
├── app.ts              # Express app setup
└── index.ts            # Application entry point
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.