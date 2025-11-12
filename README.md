# WorkZen

A comprehensive Human Resource Management System (HRMS) built with modern technologies.

## 🎥 Demo Videos

- **[Web Application Demo](https://1drv.ms/v/c/f3ac1200130e71a5/EY794yb-WrVPrpHf5qGStdUBdnAt7gDOqct-M9xLXPNZdA)** - Full walkthrough of the web interface
- **[Mobile Application Demo](https://drive.google.com/file/d/1uuAR-RfdLXUS3ssZLMEfJlhK5texhw1K/view?usp=sharing)** - Mobile responsive design showcase

## 🏗️ Architecture

**Folders:**
- `server/` - Express + Mongoose backend (CommonJS)
- `client/` - React (Vite) + TailwindCSS frontend (ESM)

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based secure authentication
- Role-based Access Control (Admin, HR, Payroll Officer, Employee)
- Protected routes with role-specific permissions
- Automatic admin assignment for first registered user

### 👥 Employee Management
- Complete CRUD operations for employee records
- Department and Designation management
- Employee profile with detailed information
- Employee search and filtering
- User account creation and management
- **Automated Welcome Emails** - New users receive login credentials via email

### 📊 Attendance Management
- Clock In/Clock Out tracking
- Attendance records with work hours calculation
- Monthly and custom date range attendance reports
- Admin/HR attendance overview and management
- Employee self-service attendance marking
- Attendance analytics and statistics

### 🏖️ Leave/Time-Off Management
- Leave request submission by employees
- Leave approval workflow for HR/Admin
- Multiple leave types support
- Leave balance tracking
- Leave history and reporting
- Leave status management (Pending, Approved, Rejected)

### 💰 Payroll Processing
- **Payrun Management** - Monthly payroll cycle management
- **Salary Structure** - Configurable salary components (Basic, HRA, DA, Allowances, Deductions)
- **Attendance-based Salary** - Automatic calculation based on worked days
- **Salary Statements** - Comprehensive salary reports
- **Payslip Generation** - Professional PDF payslips with detailed breakdowns
- **Payroll Dashboard** - Overview of payroll statistics and pending actions
- **Bulk Payroll Processing** - Process payroll for multiple employees
- Individual payslip viewing and downloading

### 📈 Reports & Analytics
- Attendance reports with filters
- Payroll reports and salary statements
- Leave reports and analytics
- Employee-wise detailed reports
- Export functionality for reports

### 📧 Email Integration
- SMTP-based email service
- Welcome email for new users with credentials
- Configurable email templates
- Fallback handling when email is not configured

### 📄 PDF Generation
- Professional payslip PDF generation
- Branded documents with company information
- Detailed salary breakdowns
- Print-ready format

### 🎨 User Interface
- Modern, responsive design with TailwindCSS
- Role-specific dashboards
- Intuitive navigation with sidebar
- Interactive data tables
- Modal-based forms and details view
- Loading states and error handling

## 🚀 Quick Start (PowerShell)

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote instance)
- npm or yarn package manager

### Backend Setup
```powershell
cd server
npm install
# Copy .env.example to .env and configure your settings
# Required: MONGO_URI, JWT_SECRET
# Optional: EMAIL configuration for welcome emails
node server.js
```

**Default Backend:** `http://localhost:5000`

### Frontend Setup
```powershell
cd client
npm install
npm run dev
```

**Default Frontend:** `http://localhost:5173`

## 🔧 Configuration

### Required Environment Variables (Backend)

Create a `.env` file in the `server/` directory:

```env
# Database
MONGO_URI=mongodb://127.0.0.1:27017/workzen

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Server Port (optional, defaults to 5000)
PORT=5000
```

### Optional Email Configuration

For automated welcome emails when creating new users:

```env
# SMTP Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=WorkZen <noreply@workzen.com>
```

📖 **Full setup guide:** See [server/EMAIL_SETUP.md](server/EMAIL_SETUP.md) for detailed configuration instructions, Gmail setup, and troubleshooting.

**Note:** The system works without email configuration - emails simply won't be sent, but user creation will still succeed.

### Frontend Environment Variables

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000
```

## 👤 Default User Roles

The system supports four role types:

1. **Admin** - Full system access (first registered user becomes admin)
2. **HR** - Manage employees, attendance, and leave requests
3. **Payroll Officer** - Manage payroll, payruns, and generate payslips
4. **Employee** - View own profile, mark attendance, request leave, view payslips

## 🗂️ Project Structure

### Backend (`server/`)
```
server/
├── config/          # Database configuration
├── controllers/     # Request handlers
│   ├── admin/       # Admin-specific controllers
│   └── hr/          # HR-specific controllers
├── middlewares/     # Authentication & authorization
├── models/          # Mongoose schemas
├── routes/          # API route definitions
│   ├── admin/       # Admin routes
│   └── hr/          # HR routes
├── services/        # Business logic layer
├── utils/           # Utility functions (email, PDF, JWT)
└── server.js        # Application entry point
```

### Frontend (`client/`)
```
client/
├── src/
│   ├── components/  # Reusable UI components
│   │   ├── forms/   # Form components
│   │   ├── layout/  # Layout components (Navbar, Sidebar)
│   │   └── ui/      # UI elements (Cards, Tables, Modals)
│   ├── context/     # React context (Auth, Sidebar)
│   ├── hooks/       # Custom React hooks
│   ├── pages/       # Page components
│   │   ├── Admin/   # Admin pages
│   │   ├── Employee/# Employee pages
│   │   ├── HR/      # HR pages
│   │   └── PayrollOfficer/ # Payroll officer pages
│   ├── services/    # API service functions
│   ├── api.js       # Axios configuration
│   └── App.jsx      # Main app with routing
└── index.html       # Entry HTML
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Main Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

#### Admin Routes (Protected)
- `GET /api/admin/employees` - Get all employees
- `POST /api/admin/employees` - Create employee
- `GET /api/admin/attendance` - View all attendance records
- `GET /api/admin/timeoff` - View all leave requests
- `GET /api/admin/payroll/dashboard` - Payroll dashboard
- `POST /api/admin/payroll/payruns` - Create new payrun
- `GET /api/admin/payroll/:id/pdf` - Download payslip PDF

#### HR Routes (Protected)
- `GET /api/hr/employees` - Manage employees
- `GET /api/hr/attendance` - Manage attendance
- `PUT /api/hr/timeoff/:id` - Approve/reject leave

#### Employee Routes (Protected)
- `GET /api/profile` - Get own profile
- `POST /api/attendance` - Mark attendance
- `POST /api/leaves` - Request leave
- `GET /api/leaves` - View own leave history

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Nodemailer** - Email service
- **PDFKit** - PDF generation

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Context API** - State management

## 🧪 Testing & Development

### Seed Data

To populate the database with sample attendance data:

```powershell
cd server
node seedAttendance.js
```

### Check Users

To view all users in the database:

```powershell
cd server
node checkUsers.js
```

## 📝 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please follow the coding guidelines in `.github/copilot-instructions.md` when making changes.

## 📧 Support

For issues and questions, please create an issue in the repository.


