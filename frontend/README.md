# Frontend Documentation

## Project Overview
This is a Next.js application that provides authentication functionality with a responsive layout. The frontend integrates with a backend API for user management and authentication.

## Component Structure
The frontend is organized into reusable components located in `/components`:

```
components/
├── ErrorMessage.js          # Displays error messages
├── Footer.js                # Main application footer
├── FormElements.js          # Reusable form components
├── Layout.js                # Main application layout
├── LoadingSpinner.js        # Loading indicator
├── Navbar.js                # Main navigation bar
├── Navigation.js           # Navigation menu
├── ProtectedRoute.js       # Route protection for auth
├── SuccessMessage.js       # Displays success messages
```

## Key Components

### Layout.js
The main application layout component that provides:
- Responsive header with navigation
- User menu for authenticated users
- Mobile-friendly navigation
- Consistent footer across all pages

**Props:**
- `title` (string): Page title (default: "Authentication App")
- `description` (string): Meta description (default: "A secure authentication solution")
- `children`: Page content

### ProtectedRoute.js
Protects routes that require authentication. Redirects to login if user is not authenticated.

### FormElements.js
Contains reusable form components with consistent styling:
- Input fields
- Buttons
- Validation messages

## Usage Examples

### Using the Layout Component
```jsx
import Layout from '../components/Layout';

export default function HomePage() {
  return (
    <Layout title="Home Page" description="Welcome to our app">
      <h1>Welcome to our application</h1>
      {/* Page content */}
    </Layout>
  );
}
```

### Using ProtectedRoute
```jsx
import ProtectedRoute from '../components/ProtectedRoute';

function Dashboard() {
  return (
    <ProtectedRoute>
      <h1>User Dashboard</h1>
      {/* Protected content */}
    </ProtectedRoute>
  );
}
```

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Styling Approach
The application uses CSS Modules for component-scoped styling:
- Each component has its own `.module.css` file
- Global styles are defined in `/styles/global.css`
- Responsive design using media queries
- Consistent theming with CSS variables

## Environment Variables
The frontend requires these environment variables:
- `NEXT_PUBLIC_API_URL`: Backend API base URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `NEXT_PUBLIC_FACEBOOK_APP_ID`: Facebook OAuth app ID
```