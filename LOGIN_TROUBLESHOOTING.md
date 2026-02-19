# Manager Panel Login - Troubleshooting Guide

## 🔧 Quick Fix Steps

### Step 1: Create Manager Account
```bash
cd UNIXA_ADMIN_PANEL_BACKEND
npm run create-manager
```

**Default Credentials:**
- Email: `manager@unixa.com`
- Password: `manager123`

---

### Step 2: Check Backend is Running
```bash
cd UNIXA_ADMIN_PANEL_BACKEND
npm run dev
```

Backend should run on: `http://localhost:5000`

---

### Step 3: Check Frontend Environment
File: `UNIXA_MANAGER_PANEL/.env`
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### Step 4: Start Manager Panel
```bash
cd UNIXA_MANAGER_PANEL
npm run dev
```

Manager Panel should run on: `http://localhost:5173` (or next available port)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Invalid email or password"
**Solution:**
- Run `npm run create-manager` in backend folder
- Use credentials: `manager@unixa.com` / `manager123`

### Issue 2: "Network Error" or "ERR_CONNECTION_REFUSED"
**Solution:**
- Check if backend is running on port 5000
- Check `.env` file has correct `VITE_API_BASE_URL`
- Check MongoDB is connected

### Issue 3: "Account is inactive"
**Solution:**
- In MongoDB, check Employee collection
- Set `status: true` for the manager account

### Issue 4: CORS Error
**Solution:**
- Backend `server.js` already has CORS configured
- Check if `http://localhost:5173` is in allowed origins

---

## 📝 Manual Manager Creation (MongoDB)

If script doesn't work, manually insert in MongoDB:

```javascript
// In MongoDB Compass or Shell
use your_database_name;

db.employees.insertOne({
  name: "Test Manager",
  email: "manager@unixa.com",
  phone: "9876543210",
  password: "$2b$10$YourHashedPasswordHere", // Use bcrypt to hash "manager123"
  role: "Manager",
  designation: "Operations Manager",
  status: true,
  address: "Test Address",
  joiningDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
});
```

---

## 🔍 Debug Checklist

- [ ] Backend running on port 5000
- [ ] MongoDB connected
- [ ] Manager account exists in database
- [ ] Manager account status is `true`
- [ ] Frontend `.env` has correct API URL
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows API call to `/api/employees/login`

---

## 🎯 Test Login API Directly

Using Postman or curl:

```bash
curl -X POST http://localhost:5000/api/employees/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@unixa.com","password":"manager123"}'
```

Expected Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test Manager",
    "email": "manager@unixa.com",
    "role": "Manager",
    "designation": "Operations Manager",
    "phone": "9876543210"
  }
}
```

---

## 📞 Still Not Working?

Check these files:
1. `UNIXA_ADMIN_PANEL_BACKEND/.env` - MongoDB URI, JWT_SECRET
2. `UNIXA_MANAGER_PANEL/.env` - API Base URL
3. Backend console for errors
4. Browser console for errors
