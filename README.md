
<img width="387" height="180" alt="Medical (3)" src="https://github.com/user-attachments/assets/2527b884-08f4-480f-9365-abb2eadfa852" />



MediTrack is a MERN-based healthcare web application for **patient wellness tracking**, **doctor appointment management**, and **real-time patient–doctor communication**. It also includes an **AI Health Assist** module with **Report Summary** + **Chat with AI** powered by the **Gemini API**.

---

##  Key Features

###  Patient Portal
- Log daily health data (sleep, mood, water, etc.)
- View health overview + insights
- Book/manage appointments
- Real-time chat with doctors

###  Doctor Portal
- Manage appointments & patient requests
- View schedule and dashboard stats
- Mark appointments as completed
- Real-time chat with patients

###  Real-time Chat (Socket.IO)
- Patient ↔ Doctor messaging
- Message history + notifications

###  AI Health Assist (Gemini API)
- **Report Summary:** Generates a summarized health report based on user logs
- **Chat with AI:** Ask health-related questions and get instant guidance
- Smart tips based on recent check-ins

---

##  Screenshots


> - `assets/patient-dashboard.png`
> - <img width="1908" height="905" alt="Screenshot 2026-02-09 104604" src="https://github.com/user-attachments/assets/6241627a-993b-4264-8bfe-50f10f405fdb" />

 
> - `assets/doctor-dashboard.png`
> - <img width="1903" height="900" alt="Screenshot 2026-02-09 104634" src="https://github.com/user-attachments/assets/6e6af0d2-2369-4a09-a6ca-277d336804d3" />

> - 



---

##  Tech Stack
- **Frontend:** React, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT (role-based access: Patient / Doctor)  
- **Real-time:** Socket.IO  
- **AI Integration:** Gemini API  

---

##  Getting Started

### 1) Clone the repository
```bash
git clone https://github.com/TharushaJM/MediTrack.git
cd MediTrack
