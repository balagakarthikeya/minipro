**Tamper-Proof Record Management System**

A secure, blockchain-based application for managing sensitive records in domains such as healthcare, education, and governance. The system ensures data integrity, tamper detection, and decentralized control using Ethereum smart contracts.

⸻

Features

Admin Module
	•	Secure Admin login and dashboard.
	•	Approve or reject hospital staff registrations.
	•	Manage existing user data and document entries.

Hospital Staff Module
	•	Signup and login functionality.
	•	Add new user profiles (citizens).
	•	Upload and manage documents for existing users.
	•	View records filtered by industry type.

Blockchain Integration
	•	Records hashed using SHA-256 and stored in Ethereum blockchain.
	•	Smart contracts verify authenticity and prevent tampering.
	•	Unique ID is auto-generated for each new profile.

Security & Audit
	•	JWT-based authentication for admin and staff.
	•	Unauthorized modifications are detected using hash comparison.
	•	Access control based on user roles.

⸻

Technologies Used
	•	Backend: Node.js, Express.js
	•	Frontend: HTML, CSS, JavaScript
	•	Blockchain: Ethereum (Ganache, Web3.js, Truffle)
	•	Database: MongoDB
	•	Security: JWT, SHA-256

⸻

File Structure

minipro/
├── backend/
│   ├── controllers/        # Business logic for each route
│   ├── middleware/         # Admin/User authentication
│   ├── models/             # MongoDB schemas
│   └── routes/             # Express routes
│
├── config/
│   └── db.js               # MongoDB connection config
│
├── contracts/
│   └── RecordManager.sol   # Solidity smart contract
│
├── migrations/             # Truffle migration scripts
│
├── public/                 # Frontend HTML pages
│   ├── index.html
│   ├── dashboard.html
│   ├── dashboard2.html
│   ├── login.html
│   ├── signup.html
│   ├── newuser.html
│   ├── view-existing-users.html
│   └── add-data-to-existing-user.html
│
├── .env                    # Environment variables
├── app.js                  # Express server setup
├── truffle-config.js       # Truffle blockchain config
└── package.json            # Node.js dependencies


⸻

Installation Guide

1. Clone the Repository

git clone https://github.com/balagakarthikeya/minipro.git
cd minipro

2. Install Dependencies

npm install

3. Start Ganache & Compile Smart Contracts

truffle compile
truffle migrate

4. Set Up Environment Variables (.env file)

PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

5. Start the Server

node app.js

Visit http://localhost:3000 to view the app.

⸻

Advantages
	•	Ensures tamper-proof record keeping.
	•	Transparent verification of records.
	•	Scalable to any industry: healthcare, education, legal.
	•	Secure login with strict access control.

⸻

Scope of the Project
	•	Can be extended to government identity management systems.
	•	Supports integration with IPFS for decentralized file storage.
	•	Can evolve into a national citizen record framework.
	•	Open for enhancements like biometric integration and role-based smart contracts.

⸻

Usage

Admin
	•	Login at /index.html
	•	View pending staff requests
	•	Approve/reject hospital accounts
	•	Manage citizen record access

Hospital Staff
	•	Signup/login via /signup.html and /login.html
	•	Add new users with auto-generated Unique ID
	•	Upload and manage documents via /add-data-to-existing-user.html
	•	View existing records via /view-existing-users.html
