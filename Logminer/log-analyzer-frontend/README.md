# 🧠 Log Analyzer Frontend 

A smart log analysis web interface.

This frontend allows users to:
- Upload log files
- Dynamically explore AI-detected errors
- Visualize anomalies and KPIs
- View intelligent error resolution suggestions

---

## 🔧 Technologies Used

- **React / Next.js**
- **Tailwind CSS** (or another CSS framework)
- **Chart.js / Recharts** for data visualization
- **Axios** for backend communication
- **React-Table** for interactive data tables

---

## 📸 Features Overview

- 📂 Upload and manage log files  
- 📊 Interactive visualization of logs with dynamic filters  
- 📈 Charts for KPIs and anomaly detection  
- 🧠 Integration with an AI-powered backend API  
- 💡 Smart suggestions for resolving log-based errors  
- 🔎 Search and filter logs by date, level (error, info, etc.), and event type  

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mohamed-ayedi/log-analyzer-frontend.git
cd log-analyzer-frontend
````

### 2. Setup Environment Variables
After registering an application on Microsoft Azure Portal
(Azure Active Directory > App registrations), retrieve the following information:

✅ Client ID

✅ Client Secret

✅ Redirect URI

✅ Scope

✅ Token Endpoint URL

Then, create your .env file based on the example:
```bash
cp .env.example .env
```
Now, fill in your actual values from Azure in the .env file

NEXT_PUBLIC_CLIENT_ID=your-azure-client-id
NEXT_PUBLIC_CLIENT_SECRET=your-azure-client-secret
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/handle
NEXT_PUBLIC_SCOPE=openid profile email
NEXT_PUBLIC_TOKEN_URL=https://login.microsoftonline.com/<your-tenant-id>/oauth2/v2.0/token


### 3. Install Dependencies
```bash
npm install
npm install react-hot-toast
npm install lucide-react
npm install jwt-decode
npm install @heroicons/react
npm install sockjs-client stompjs


```

### 4.Run the Development Server
```bash
npm run dev
```

The app should now be running at:
📍 http://localhost:3000
<<<<<<< HEAD


=======
>>>>>>> 85eb030e6723a14bdf81557ab0330e449877ee85
