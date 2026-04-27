
# 🏦 Bank Token Generation System

## 📌 Project Overview
This is a full-stack Bank Token Generation System designed to manage customer queues in banks efficiently. Customers can generate tokens and track their waiting status in real-time. The system reduces crowding and improves service flow in bank counters.

---

## ✨ Key Features

### 👤 Customer Side
- 🎫 Generate real-time token number
- ⏳ View estimated waiting time
- 📊 See current running token number
- 🔔 Notification when turn is near (sound alert + message)
- ⚡ Alert message: "Your turn is coming, please be ready"
- 🎉 Notification when token is active: "This is your turn"

---

### 🏦 Counter System
- 🧾 3 Service Counters:
  - Cash Counter
  - Loan Counter
  - General Services Counter
- 🔄 Each counter serves one token at a time
- 📢 Automatic token movement between counters

---

### 🔊 Smart Alert System
- Sound notification when user is next in queue
- Alert when only 3 people are ahead
- Real-time updates for every token movement

---

### 👨‍💼 Manager Dashboard
- 📊 View total tokens generated per day
- ⏰ Peak hours analysis (busy time tracking)
- 📈 Weekly analytics chart (7 days report)
- 👥 Monitor all counters in real-time
- 📉 Queue load visualization

---

## 🛠️ Tech Stack

### Frontend:
- React.js
- HTML5
- CSS3
- JavaScript

### Backend:
- Java (Spring Boot)
- REST APIs
- Eclipse IDE

### Database:
- MySQL

---

## 🚀 How It Works
1. Customer selects service type
2. System generates token number
3. Token enters queue system
4. Counters serve tokens one by one
5. User gets real-time updates and alerts
6. Manager monitors all activity via dashboard

---

## 📊 Dashboard Features
- Daily token statistics
- Weekly usage chart
- Peak traffic time analysis
- Counter performance tracking

---

## 🔐 Security Note
Sensitive configuration like database credentials are excluded using `.gitignore` and managed securely.

---

## 👨‍💻 Author
- Full Stack Java Developer
- Project: Bank Token Management System

---

## 🚀 Future Improvements
- SMS/WhatsApp token notifications
- Mobile app version
- AI-based queue prediction system
