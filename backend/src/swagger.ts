import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Loan Management System API",
    version: "1.0.0",
    description: "REST API for the LMS — Borrower Portal + Operations Dashboard",
  },
  servers: [{ url: "http://localhost:5000", description: "Local Dev Server" }],
  tags: [
    { name: "Auth",         description: "Authentication — all roles" },
    { name: "Borrower",     description: "Borrower portal — step-by-step loan application" },
    { name: "Sales",        description: "Sales module — lead tracking" },
    { name: "Sanction",     description: "Sanction module — approve / reject loans" },
    { name: "Disbursement", description: "Disbursement module — release funds" },
    { name: "Collection",   description: "Collection module — record payments" },
    { name: "Admin",        description: "Admin — user management & system stats" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "JWT stored in httpOnly cookie. Login first to get the cookie.",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id:    { type: "string", example: "664abc123def456" },
          name:  { type: "string", example: "Test Borrower" },
          email: { type: "string", example: "test@borrower.com" },
          role:  { type: "string", enum: ["ADMIN","SALES","SANCTION","DISBURSEMENT","COLLECTION","BORROWER"] },
        },
      },
      Loan: {
        type: "object",
        properties: {
          _id:                { type: "string" },
          borrower:           { type: "string" },
          pan:                { type: "string", example: "ABCDE1234F" },
          dob:                { type: "string", format: "date" },
          monthlyIncome:      { type: "number", example: 50000 },
          employmentMode:     { type: "string", enum: ["SALARIED","SELF_EMPLOYED","UNEMPLOYED"] },
          salarySlipUrl:      { type: "string" },
          loanAmount:         { type: "number", example: 100000 },
          tenure:             { type: "number", example: 180 },
          interestRate:       { type: "number", example: 12 },
          simpleInterest:     { type: "number", example: 5917.81 },
          totalRepayment:     { type: "number", example: 105917.81 },
          status:             { type: "string", enum: ["APPLIED","SANCTIONED","DISBURSED","CLOSED","REJECTED"] },
          rejectionReason:    { type: "string", nullable: true },
          amountPaid:         { type: "number", example: 0 },
          outstandingBalance: { type: "number", example: 105917.81 },
          createdAt:          { type: "string", format: "date-time" },
        },
      },
      Payment: {
        type: "object",
        properties: {
          _id:         { type: "string" },
          loan:        { type: "string" },
          recordedBy:  { type: "string" },
          utrNumber:   { type: "string", example: "UTR123456789" },
          amount:      { type: "number", example: 10000 },
          paymentDate: { type: "string", format: "date" },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
  security: [{ cookieAuth: [] }],
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new borrower",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name","email","password"],
                properties: {
                  name:     { type: "string", example: "John Doe" },
                  email:    { type: "string", example: "john@example.com" },
                  password: { type: "string", example: "Pass@123" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Account created", content: { "application/json": { schema: { properties: { message: { type: "string" }, user: { "$ref": "#/components/schemas/User" } } } } } },
          "409": { description: "Email already registered" },
          "400": { description: "Missing fields" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login — sets JWT cookie",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email","password"],
                properties: {
                  email:    { type: "string", example: "admin@lms.com" },
                  password: { type: "string", example: "Admin@123" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Login successful" },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout — clears cookie",
        responses: { "200": { description: "Logged out" } },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get currently logged-in user",
        responses: {
          "200": { description: "User profile" },
          "401": { description: "Not authenticated" },
        },
      },
    },
    "/api/borrower/personal-details": {
      post: {
        tags: ["Borrower"],
        summary: "Step 2 — Submit personal details + run BRE",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["pan","dob","monthlyIncome","employmentMode"],
                properties: {
                  pan:            { type: "string", example: "ABCDE1234F" },
                  dob:            { type: "string", format: "date", example: "1995-05-15" },
                  monthlyIncome:  { type: "number", example: 50000 },
                  employmentMode: { type: "string", enum: ["SALARIED","SELF_EMPLOYED","UNEMPLOYED"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "BRE passed — details saved" },
          "422": { description: "BRE failed — rejection reason returned" },
          "400": { description: "Missing fields" },
        },
      },
    },
    "/api/borrower/upload-slip": {
      post: {
        tags: ["Borrower"],
        summary: "Step 3 — Upload salary slip (PDF/JPG/PNG, max 5MB)",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  salarySlip: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "File uploaded — salarySlipUrl returned" },
          "400": { description: "No file / wrong format" },
        },
      },
    },
    "/api/borrower/apply": {
      post: {
        tags: ["Borrower"],
        summary: "Step 4 — Configure loan and apply",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["loanAmount","tenure"],
                properties: {
                  loanAmount: { type: "number", example: 100000, description: "₹50,000 – ₹5,00,000" },
                  tenure:     { type: "number", example: 180,    description: "Days — 30 to 365" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Loan application created (status: APPLIED)", content: { "application/json": { schema: { properties: { message: { type: "string" }, loan: { "$ref": "#/components/schemas/Loan" } } } } } },
          "400": { description: "Validation error / incomplete profile" },
          "409": { description: "Active loan already exists" },
        },
      },
    },
    "/api/borrower/my-loans": {
      get: {
        tags: ["Borrower"],
        summary: "View own loan applications and status",
        responses: {
          "200": { description: "List of borrower's loans" },
        },
      },
    },
    "/api/sales/leads": {
      get: {
        tags: ["Sales"],
        summary: "List borrowers who registered but haven't applied yet",
        responses: {
          "200": { description: "Lead list" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/sanction/loans": {
      get: {
        tags: ["Sanction"],
        summary: "List all APPLIED loans pending review",
        responses: { "200": { description: "Applied loan list" } },
      },
    },
    "/api/sanction/loans/{id}/approve": {
      patch: {
        tags: ["Sanction"],
        summary: "Approve a loan — APPLIED → SANCTIONED",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Loan sanctioned" },
          "400": { description: "Loan not in APPLIED status" },
          "404": { description: "Loan not found" },
        },
      },
    },
    "/api/sanction/loans/{id}/reject": {
      patch: {
        tags: ["Sanction"],
        summary: "Reject a loan — APPLIED → REJECTED",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["reason"],
                properties: { reason: { type: "string", example: "Low credit score" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Loan rejected" },
          "400": { description: "Missing reason or wrong status" },
        },
      },
    },
    "/api/disbursement/loans": {
      get: {
        tags: ["Disbursement"],
        summary: "List all SANCTIONED loans ready for disbursement",
        responses: { "200": { description: "Sanctioned loan list" } },
      },
    },
    "/api/disbursement/loans/{id}/disburse": {
      patch: {
        tags: ["Disbursement"],
        summary: "Disburse a loan — SANCTIONED → DISBURSED",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Loan disbursed" },
          "400": { description: "Loan not in SANCTIONED status" },
        },
      },
    },
    "/api/collection/loans": {
      get: {
        tags: ["Collection"],
        summary: "List all active (DISBURSED) loans",
        responses: { "200": { description: "Disbursed loan list" } },
      },
    },
    "/api/collection/loans/{id}/payment": {
      post: {
        tags: ["Collection"],
        summary: "Record a payment — auto-closes loan when fully paid",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["utrNumber","amount","paymentDate"],
                properties: {
                  utrNumber:   { type: "string", example: "UTR123456789" },
                  amount:      { type: "number", example: 10000 },
                  paymentDate: { type: "string", format: "date", example: "2026-04-28" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Payment recorded. Loan auto-closes if fully paid." },
          "409": { description: "Duplicate UTR number" },
          "400": { description: "Overpayment / wrong status / missing fields" },
        },
      },
    },
    "/api/collection/loans/{id}/payments": {
      get: {
        tags: ["Collection"],
        summary: "View all payments made for a specific loan",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Payment history" } },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users across all roles",
        responses: { "200": { description: "User list" } },
      },
      post: {
        tags: ["Admin"],
        summary: "Create a user with any role (e.g. add new executives)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name","email","password","role"],
                properties: {
                  name:     { type: "string", example: "New Executive" },
                  email:    { type: "string", example: "exec@lms.com" },
                  password: { type: "string", example: "Exec@123" },
                  role:     { type: "string", enum: ["ADMIN","SALES","SANCTION","DISBURSEMENT","COLLECTION","BORROWER"] },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "User created" },
          "409": { description: "Email already exists" },
        },
      },
    },
    "/api/admin/users/{id}": {
      delete: {
        tags: ["Admin"],
        summary: "Delete a user by ID",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "User deleted" },
          "404": { description: "User not found" },
        },
      },
    },
    "/api/admin/loans": {
      get: {
        tags: ["Admin"],
        summary: "View ALL loans — optionally filter by status",
        parameters: [{
          in: "query", name: "status", required: false,
          schema: { type: "string", enum: ["APPLIED","SANCTIONED","DISBURSED","CLOSED","REJECTED"] },
        }],
        responses: { "200": { description: "Full loan list" } },
      },
    },
    "/api/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "System-wide dashboard stats",
        responses: {
          "200": {
            description: "Stats object",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    users:    { type: "object", properties: { total: { type: "number" }, borrowers: { type: "number" } } },
                    loans:    { type: "object", properties: { total: { type: "number" }, applied: { type: "number" }, sanctioned: { type: "number" }, disbursed: { type: "number" }, closed: { type: "number" }, rejected: { type: "number" } } },
                    finance:  { type: "object", properties: { totalDisbursed: { type: "number" }, totalRepayable: { type: "number" } } },
                    payments: { type: "object", properties: { total: { type: "number" } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: "LMS API Docs",
  }));
  console.log("Swagger docs available at http://localhost:5000/api-docs");
}
