Green Hydrogen Subsidy Disbursement System
A Blockchain + MERN Based Smart Subsidy Automation Platform
🚀 Overview

The Green Hydrogen Subsidy Disbursement System is a blockchain-powered platform that automates the release of government subsidies based on milestone verification.
It ensures transparency, immutability, fraud prevention, and faster fund releases.

This project is built using:

React + TailwindCSS (Frontend)

Node.js + Express + MongoDB (Backend)

Ethereum Sepolia Testnet + Hardhat + MetaMask + Smart Contracts (Blockchain)

📁 Project Folder Structure
project/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
│
└── smart-contracts/
    ├── contracts/
    ├── scripts/
    ├── hardhat.config.js
    └── package.json

⚙️ Prerequisites

Ensure you have the following installed:

✔ Node.js (v16+)
✔ npm
✔ MetaMask browser extension
✔ Hardhat
✔ MongoDB Atlas or local MongoDB

🛠️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/green-hydrogen-subsidy-system.git
cd green-hydrogen-subsidy-system

📌 Backend Setup

Move to backend folder:
cd backend
Install dependencies:
npm install


Create a .env file:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
PORT=5000


Run backend server:
npm run dev

You should see:

Server running on port 5000
MongoDB Connected

💻 Frontend Setup
Open a second terminal:
cd frontend

Install frontend packages:
npm install

Start frontend development server:
npm run dev

React app will run at:
👉 http://localhost:5173/

🔗 Smart Contracts Setup (Hardhat)
Navigate to the smart contract folder:
cd smart-contracts

Install dependencies:
npm install
npm ethers

Compile Smart Contracts
npx hardhat compile

Start Hardhat Local Blockchain Node
npx hardhat node

This runs a local Ethereum network with funded accounts.

Deploy Smart Contracts

In a new terminal:
npx hardhat run scripts/deploy.js --network localhost

🔐 MetaMask Configuration
Open MetaMask → Add Network → Localhost 8545
Import private keys from Hardhat (printed in terminal)
Connect MetaMask to your frontend app

💡 Features
Government

✔ Create subsidy schemes
✔ Review producer applications
✔ Register schemes on blockchain

Producers

✔ Enroll in subsidy schemes
✔ Upload milestone proof
✔ Monitor blockchain transaction status

Auditors

✔ Verify milestones

Bank / Finance Authority

✔ Release funds via smart contract

Blockchain Layer

✔ Smart contract-based subsidy automation
✔ Immutable milestone tracking
✔ Transparent payment flow

🧪 Testing

All REST API endpoints were tested using POSTMAN:

Login
CRUD on schemes
Milestone submission
Verification
Subsidy release

You may add:
Login Screen
Dashboard
Create Scheme
Producer Enrollment
Milestone Upload
MetaMask Transaction Popup
Blockchain Explorer Hash

👥 Team Members
Name	Role
Tisha Jain	Frontend, MetaMask integration, UI/UX
Preksha Joshi	Backend, API design, MongoDB, Smart Contracts

📜 License
This project is for academic purposes (IT645 – Web & Mobile Technology).
