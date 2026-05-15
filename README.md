# CreditSea Loan Management System

Hosted Application: https://CredSync-sandy.vercel.app/

## Project Overview

This is a comprehensive Loan Management System built to handle the end-to-end lifecycle of a loan application. The application supports multiple user roles, including Borrowers who apply for loans, and internal administrative roles (Admin, Sales, Sanction, Disbursement, and Collection) who process and manage those applications.

The system is built using a modern technology stack:
- Frontend: Next.js (React), Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: MongoDB

**API Documentation:** [(https://credsync-backend.onrender.com/api-docs)](https://credsync-backend.onrender.com/api-docs))

## Folder Structure

The repository is structured into two main directories: frontend and backend.

```text
Credit_sea_assign
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic and request handling
│   │   ├── middleware/       # Authentication and file upload handlers
│   │   ├── models/           # Mongoose database schemas
│   │   ├── routes/           # API endpoint definitions
│   │   ├── db.ts             # Database connection setup
│   │   ├── index.ts          # Express server entry point
│   │   └── swagger.ts        # API documentation setup
│   ├── package.json          # Backend dependencies
│   └── tsconfig.json         # TypeScript configuration
│
├── frontend/
│   ├── app/
│   │   ├── borrower/         # Borrower dashboard and loan application flow
│   │   ├── dashboard/        # Internal staff dashboards (Admin, Sanction, etc.)
│   │   ├── login/            # User authentication
│   │   ├── register/         # User registration
│   │   ├── layout.tsx        # Global layout component
│   │   └── page.tsx          # Landing page
│   ├── lib/
│   │   └── api.ts            # Axios configuration and API service functions
│   ├── package.json          # Frontend dependencies
│   └── tailwind.config.ts    # Tailwind CSS configuration
│
└── README.md                 # Project documentation
```

## Database Schemas

The application relies on a MongoDB database utilizing Mongoose for schema validation. Below are the primary entities and their fields.

### User Schema
Stores all user information, including role-based access control and borrower profile details.

- name (String, required)
- email (String, required, unique)
- password (String, required)
- role (Enum: ADMIN, SALES, SANCTION, DISBURSEMENT, COLLECTION, BORROWER)
- pan (String, optional)
- dob (Date, optional)
- monthlyIncome (Number, optional)
- employmentMode (Enum: SALARIED, SELF_EMPLOYED, UNEMPLOYED)
- salarySlipUrl (String, optional)
- timestamps (createdAt, updatedAt)

### Loan Application Schema
Manages the lifecycle, financial details, and status of a loan.

- borrower (ObjectId referenced to User, required)
- pan (String, required)
- dob (Date, required)
- monthlyIncome (Number, required)
- employmentMode (String, required)
- salarySlipUrl (String, required)
- loanAmount (Number, required)
- tenure (Number, required, in days)
- interestRate (Number, default 12%)
- simpleInterest (Number, required)
- totalRepayment (Number, required)
- status (Enum: APPLIED, SANCTIONED, DISBURSED, CLOSED, REJECTED)
- rejectionReason (String, optional)
- sanctionedBy (ObjectId referenced to User, optional)
- disbursedBy (ObjectId referenced to User, optional)
- amountPaid (Number, default 0)
- outstandingBalance (Number, required)
- timestamps (createdAt, updatedAt)

### Payment Schema
Records individual payment transactions made towards an active loan.

- loan (ObjectId referenced to LoanApplication, required)
- recordedBy (ObjectId referenced to User, required)
- utrNumber (String, required, unique)
- amount (Number, required)
- paymentDate (Date, required)
- timestamps (createdAt, updatedAt)

## Run Commands

To run the application locally, you will need Node.js and MongoDB installed on your machine.

### 1. Start the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm install
npm run dev
```

The backend server will typically start on port 5000. Ensure you have a `.env` file configured in the backend directory with your `PORT`, `MONGO_URI`, and `JWT_SECRET` variables.

### 2. Start the Frontend

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

The frontend development server will start on port 3000. You can access the application by navigating to `http://localhost:3000` in your web browser.
