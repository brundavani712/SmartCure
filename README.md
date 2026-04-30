# 🏥 SmartCure - Hospital Management System (HMS)

SmartCure is a comprehensive, real-time Hospital Management System designed to streamline healthcare administration, empower patients, and optimize clinical workflows.

## 🌟 Key Features

*   **🔒 Secure Role-Based Access Control (RBAC):** Distinct portals for Administrators, Doctors, and Patients, secured with JWT and bcrypt password hashing.
*   **🧑‍⚕️ Doctor Console:** A streamlined workflow for doctors to view their daily patient queue, review medical histories, record clinical diagnoses, and issue multi-drug prescriptions.
*   **🏥 Front-Desk Administration:** Rapid patient registration with auto-generated unique Patient IDs (e.g., `NSR-HMS-2026-0001`) and automated credential generation.
*   **📱 Patient Empowerment Portal:** A secure, read-only dashboard where patients can view their medical history, track billing, and book appointments.
*   **📅 Automated Appointment Booking:** Patients can book available time slots with their preferred doctors, updating the hospital schedule instantly.
*   **📄 PDF Prescriptions:** Patients can instantly download officially formatted digital prescriptions using `jsPDF`.
*   **📊 Administrative Analytics:** Real-time dashboards featuring interactive charts (powered by `recharts`) tracking patient intake, top presenting illnesses, and doctor appointment loads to prevent burnout.
*   **📤 Bulk Data Import:** A dedicated backend route allows administrators to upload JSON datasets to instantly populate the database with patients, users, and appointments.

## 🛠️ Technology Stack

*   **Frontend:** React.js, Vite, CSS (Custom Glassmorphism Design), Lucide-React (Icons), Recharts (Analytics), jsPDF (Document Generation)
*   **Backend:** Node.js, Express.js
*   **Security:** JSON Web Tokens (JWT) for stateless authentication, `bcryptjs` for secure password hashing.
*   **Database:** Lightweight JSON file-based database for simple local deployment (Easily swappable to MongoDB/PostgreSQL).

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/brundavani712/SmartCure.git
    cd SmartCure
    ```

2.  **Start the Backend Server:**
    ```bash
    cd backend
    npm install
    node server.js
    ```
    *The backend will run on `http://localhost:5000`.*

3.  **Start the Frontend Application (in a new terminal):**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    *The frontend will run on `http://localhost:5173`.*

## 🧪 Demo Accounts

To explore the different portals, you can use the following pre-configured demo accounts on the login screen:

*   **Admin Access:**
    *   **Username:** `admin`
    *   **Password:** `admin123`
*   **Doctor Access:**
    *   **Username:** `doctor`
    *   **Password:** `doc123`

*(To test the Patient Portal, log in as Admin, register a new patient, and use the auto-generated Patient ID and OTP to log in!)*
