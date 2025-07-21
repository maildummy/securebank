# SecureBank - Online Banking Platform

SecureBank is a modern, responsive online banking platform with comprehensive admin dashboard and user management features.

## Features

### User Features
- Secure signup and authentication
- Dashboard with account overview
- Credit card submission and management
- Real-time messaging with admin
- Profile management

### Admin Features
- Comprehensive admin dashboard
- User management (approve, reject, suspend users)
- View and verify credit card submissions
- Real-time messaging with users
- Activity logs and security monitoring
- User session management

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express.js
- **State Management**: React Query
- **Routing**: Wouter
- **Data Validation**: Zod
- **Authentication**: Custom session-based auth with JWT

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/securebank.git
   cd securebank
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the application at http://localhost:5000

### Default Admin Account
- **Username**: Jude_Ogwu.U
- **Password**: Jude_O.U@2000

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Deployment to Render.com

1. Fork this repository to your GitHub account
2. Create a new Blueprint on Render.com pointing to your forked repository
3. Render will automatically detect the `render.yaml` file and deploy both frontend and backend services
4. Access your deployed application using the URL provided by Render

## Project Structure

```
securebank/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   └── App.tsx       # Main application component
│   └── index.html        # HTML entry point
├── data/                 # JSON data files (users, messages, etc.)
├── server/               # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data storage logic
└── shared/               # Shared code between frontend and backend
    └── schema.ts         # Zod schemas for validation
```

## Development

### Development Workflow

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Make your changes to the code
3. Test your changes locally
4. Commit and push your changes
5. Deploy to production

### File-based Storage

This project uses file-based storage for simplicity. The data is stored in JSON files in the `data/` directory:

- `users.json`: User accounts
- `messages.json`: Messages between users and admin
- `sessions.json`: Active user sessions
- `creditCards.json`: Credit card submissions
- `notifications.json`: System notifications

For production use, consider implementing a proper database solution.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React Query](https://tanstack.com/query/latest) for data fetching 