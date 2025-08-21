# Tomorrow's Datagram - College Activity Board

A Next.js-based activity board where college students can discover and join activities. Features authentication with roll numbers, manual ID verification, and three types of activities: Open Events, Communities, and College-Funded projects.

## Features

- **Authentication**: Roll number-based signup/login system
- **ID Verification**: Manual verification with student ID upload
- **Activity Types**:
  - **Open Events**: Simple meetups and casual activities
  - **Communities**: Ongoing groups and clubs
  - **College Funded**: Formal events requiring funding approval
- **Social Features**: Like, comment, join, and report activities
- **Admin Interface**: Verification approval and report management
- **Search & Filters**: Find activities by genre, type, and keywords
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with HTTP-only cookies
- **File Upload**: Local storage (configurable for S3)
- **Validation**: Zod schemas with comprehensive server-side validation

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd activity-board
npm install
```

2. **Set up environment variables**:
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/activity_board"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secure-jwt-secret-key-here"

# App Environment
NODE_ENV="development"
```

3. **Set up the database**:
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed with sample data
npx prisma db seed
```

4. **Create uploads directory**:
```bash
mkdir -p uploads/verification
```

5. **Start the development server**:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── users/         # User management
│   │   ├── activities/    # Activity CRUD and interactions
│   │   └── admin/         # Admin endpoints
│   ├── auth/              # Authentication page
│   ├── dashboard/         # Main activity feed
│   ├── create/            # Activity creation form
│   ├── profile/           # User profile and verification
│   ├── activity/[id]/     # Activity detail page
│   └── admin/             # Admin interfaces
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── Navbar.tsx        # Navigation component
│   └── ActivityCard.tsx  # Activity display component
├── lib/                  # Utility libraries
│   ├── prisma.ts         # Database client
│   ├── auth.ts           # Authentication utilities
│   ├── validation.ts     # Zod validation schemas
│   └── utils.ts          # Helper functions
└── prisma/
    └── schema.prisma     # Database schema
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `POST /api/users/me/verify` - Upload ID for verification

### Activities
- `GET /api/activities` - List activities (with search/filters)
- `POST /api/activities` - Create activity (verified users only)
- `GET /api/activities/:id` - Get activity details
- `PUT /api/activities/:id` - Update activity (author/admin only)
- `DELETE /api/activities/:id` - Delete activity (author/admin only)

### Activity Interactions
- `POST /api/activities/:id/like` - Toggle like
- `GET /api/activities/:id/comments` - Get comments
- `POST /api/activities/:id/comments` - Add comment
- `POST /api/activities/:id/join` - Join activity
- `DELETE /api/activities/:id/join` - Leave activity
- `POST /api/activities/:id/report` - Report activity

### Admin (Admin users only)
- `GET /api/admin/verification-requests` - List pending verifications
- `POST /api/admin/verification-requests/:id/approve` - Approve verification
- `POST /api/admin/verification-requests/:id/reject` - Reject verification
- `GET /api/admin/reports` - List open reports

## Activity Types & Validation

### Open Events
Simple meetups and casual activities. Required fields:
- Title (5-120 chars)
- Description (15-2000 chars)
- Genre, frequency
- Start date (required for non-on-demand)

### Community Activities
Ongoing groups and clubs. Additional required fields:
- Community name (3-50 chars)
- Goals description
- Meeting frequency

### College Funded
Formal events requiring funding. Additional required fields:
- Funding goal (amount in ₹)
- Budget breakdown (must sum to ±5% of funding goal)
- Venue requirement
- Expected attendees
- Safety plan
- Representative contact details

## Database Schema

Key models:
- **User**: Roll number, verification status, admin flag
- **VerificationRequest**: ID upload and admin approval workflow
- **Activity**: Core activity data with type-specific JSON fields
- **Like/Comment/JoinRequest**: Social interactions
- **Report**: Content moderation system

## Security Features

- Password hashing with bcrypt
- JWT tokens in HTTP-only cookies
- Server-side input validation and sanitization
- File upload restrictions (type, size)
- Rate limiting on activity creation
- Admin-only routes protection
- XSS prevention with HTML sanitization

## Development

### Adding New Features

1. **Database Changes**: Update `prisma/schema.prisma` and run `npx prisma db push`
2. **API Routes**: Add to `src/app/api/` with proper validation
3. **UI Components**: Create in `src/components/` following existing patterns
4. **Validation**: Add schemas to `src/lib/validation.ts`

### Testing

```bash
# Run validation tests
npm test

# Type checking
npm run build
```

### Environment Setup

For production deployment:
1. Set up PostgreSQL database
2. Configure environment variables
3. Set up file storage (S3 recommended)
4. Enable HTTPS for secure cookies
5. Set up proper CORS if needed

## Admin Setup

To create an admin user:
1. Create a regular account
2. Manually update the database:
```sql
UPDATE users SET "isAdmin" = true WHERE "rollNumber" = 'YOUR_ROLL_NUMBER';
```

## Deployment

The app is ready for deployment on platforms like Vercel, Railway, or any Node.js hosting service. Make sure to:
- Set up environment variables
- Configure database connection
- Set up file storage for uploads
- Enable HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
