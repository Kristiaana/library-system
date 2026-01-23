# Library Management System

A simple library reader & book management system built as a study project.

## 🛠 Tech Stack

### Frontend
- Nuxt 3
- Vue 3 (Composition API)
- TypeScript
- Nuxt UI
- Tailwind CSS

### Backend
- NestJS
- TypeScript
- TypeORM
- SQLite

---

## ✨ Features

- 📚 Books management (create, edit, delete)
- 👤 Readers management (create, edit, delete)
- 🔄 Book loans with validation
- ❌ Prevent deleting books with copies or active loans
- ❌ Prevent deactivating readers with active loans
- 🔍 Search books, readers, loans and copies by multiple fields


---

## 🚀 Getting Started

### 1. Clone repository
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name


cd backend
npm install
npm run start:dev

cd frontend
npm install
npm run dev
