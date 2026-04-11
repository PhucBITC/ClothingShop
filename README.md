<p align="center">
  <img src="frontend/src/assets/Logo/Lighter%20and%20Princess.png" alt="Lighter and Princess Logo" width="350">
</p>

<h1 align="center">👑 Lighter and Princess</h1>
<p align="center"><b>Elevating Fashion with AI Intelligence and Seamless Experience</b></p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Development-orange.svg" alt="Status">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.4.2-brightgreen.svg" alt="Spring Boot">
  <img src="https://img.shields.io/badge/React-19-blue.svg" alt="React">
  <img src="https://img.shields.io/badge/License-MIT-purple.svg" alt="License">
</p>

---

## 📖 Overview

**Lighter and Princess** is a sophisticated E-Commerce solution designed for the modern fashion industry. It integrates cutting-edge **AI Virtual Try-on** technology and **Intelligent Chatbots** to provide an immersive shopping experience. Built with a robust **Java Spring Boot** backend and a dynamic **React** frontend, it ensures security, scalability, and performance.

### 🚀 Key Innovations
*   **✨ Fitroom Virtual Try-on**: Experience clothes before you buy. Our AI-powered virtual fitting room uses the Fitroom API to show how clothes look on real-world models or avatars.
*   **🤖 Smart AI Assistant**: A personalized shopping guide powered by Groq LLM, helping users find the perfect outfit and answering any product queries in real-time.
*   **🛡️ Secure Architecture**: Implementing JWT Stateless Authentication for secure, scalable access across all devices.
*   **📊 Enterprise-Grade Admin Dashboard**: Deep business insights, automated order management, and intuitive inventory control.
*   **🌓 Adaptive UI**: Full support for **Dark & Light Themes** to provide a comfortable viewing experience at any time.

---

## 🛠️ Tech Stack

### Backend
- **Core**: Java 21, Spring Boot 3.4.2
- **Security**: Spring Security, JWT, OAuth2 (Google/Facebook)
- **Data**: Spring Data JPA, MySQL
- **Payments**: VNPay, PayPal SDK
- **Reporting**: Apache POI (Excel), OpenPDF (Invoices)

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS (Variables-based Theming), Framer Motion
- **Charts**: Recharts (for Analytics)
- **Maps**: Leaflet (Optional utility)

### AI & Intelligence
- **Virtual Fitting**: Fitroom API
- **NLP/Chatbot**: Groq LLM API

---

## 📸 System Showcase (Visual Roadmap)

> [!TIP]
> **Recommended Screenshots:** To give recruiters and users a 360° view of your project, we recommend capturing the following UI components:

### 1️⃣ Customer Experience 🛍️
- **Landing Page**: Showcase the hero section and featured collections.
- **Product Details & Search**: Show off the filter/search bar and beautiful product galleries.
- **Smart AI Chatbot**: A screenshot of a conversation with the AI assistant.
- **Virtual Try-on**: A clear view of the "Try it on" feature in action.

### 2️⃣ Checkout & Payments 💳
- **Shopping Cart**: The dynamic sidebar or cart page with price calculations.
- **Payment Method Selection**: Showcase the integration of **VNPay** and **PayPal** options.
- **Order Status & Details**: A detailed view of a placed order, showing item lists and current status.

### 3️⃣ Administrative Intelligence ⚙️
- **Analytics Dashboard**: Show those beautiful charts (Recharts) representing sales and data.
- **Order Management**: The grid view of orders with status badges.
- **Inventory Control**: Management of stock levels and product entries.
- **Report Exports**: A screenshot of the "Export PDF/Excel" buttons and maybe the generated file.

### 4️⃣ UI Innovation 🌓
- **Dark Theme Mode**: Showcase the application's stunning dark interface design.
- **Security & Access**: Clean authentication UI with **Google/Facebook** login buttons.

---

## ⚙️ Getting Started

### Prerequisites
- **JDK 21**
- **Node.js (LTS)**
- **MySQL Server**
- **Maven**

### 1. Backend Configuration
Create a `.env` file in the `clothingsystem` directory and populate it with your credentials:

```bash
# Database & General
DB_URL=jdbc:mysql://localhost:3306/clothing_db
DB_USERNAME=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret

# Social Login
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...

# Mail Service
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...

# VNPay Payment
VNP_TMN_CODE=...
VNP_HASH_SECRET=...
VNP_PAY_URL=...

# PayPal Payment
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox

# AI Configuration
GROQ_API_KEY=...
FITROOM_API_KEY=...
```

### 2. Execution
**Run Backend:**
```bash
cd clothingsystem
mvn spring-boot:run
```

**Run Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```text
.
├── clothingsystem/         # Java Spring Boot Backend
│   ├── src/main/java/      # Business Logic, Controllers, Services
│   ├── src/main/resources/ # Configuration & Static Assets
│   └── pom.xml             # Backend dependencies
├── frontend/               # React Vite Frontend
│   ├── src/components/     # Reusable UI Components
│   ├── src/pages/          # Application Pages
│   └── package.json        # Frontend dependencies
└── README.md               # Project documentation
```

---

## 🤝 Connect with me

<div align="center">
  <a href="https://github.com/PhucBITC">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
</div>

<p align="center">Made with ❤️ for Fashion and Technology</p>
