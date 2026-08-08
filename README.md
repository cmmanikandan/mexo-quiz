# MEXO Quiz

> **Learn. Play. Compete. Improve.**

MEXO Quiz is the production-ready interactive learning, live competition, homework assessment, and certification platform built as the third application in the **MEXO Ecosystem** (alongside **MEXO Mail** and **MEXO Forms**).

---

## ✨ Features

- 🔐 **Unified MEXO Identity & Auth**: Uses the shared Supabase project and `profiles` table. Single Sign-On across MEXO Mail, MEXO Forms, and MEXO Quiz.
- 🎓👨‍🏫⚡ **Multi-Role Workspace Selector**: Easily switch between **Student Mode**, **Teacher Mode**, and **Admin Mode** in one click.
- 🧩 **16 Question Types**: Multiple Choice, Multiple Select, True/False, Fill Blank, Short Answer, Paragraph, Dropdown, Matching, Ordering, Image, Audio, Video, Code, Math Formula (LaTeX), Poll, Hotspot.
- 🛠️ **Quiz Builder**: Drag-and-drop question reordering, bulk import (CSV/JSON/TXT/MEXO Forms), question bank integration, availability scheduling, shuffle, per-question/whole-quiz timers, certificate thresholds, auto-grading.
- ⚡ **Live Quiz Competition**: Join code generation (e.g. `MEXO-9482`), QR codes, waiting room lobby, countdowns, real-time leaderboard, host controls (Pause, Resume, End, Remove player, Music toggle).
- 🏆 **Results & Certificates**: Interactive performance charts (`recharts`), answer review with explanations, verifiable MEXO Certificates of Achievement (view/print/PDF), confetti celebration.
- 📊 **Dashboards & Analytics**: Student dashboard, Teacher dashboard (classrooms, homework assignments, question bank, item discrimination analytics), Admin control center.
- 📱 **PWA & Mobile Ready**: Responsive bottom navigation, installable PWA manifest, service worker offline caching.

---

## 🛠️ Technology Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Apple / Linear / Notion inspired SaaS aesthetics)
- **Backend & Auth**: Supabase JS (Shared profiles table & GoTrue authentication)
- **UI Components & Icons**: Radix UI + Lucide React
- **Charts & Motion**: Recharts + Framer Motion
- **Interactive Helpers**: `qrcode.react`, `canvas-confetti`, `date-fns`

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/cmmanikandan/mexo-quiz.git
cd mexo-quiz

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration (`.env`)

```env
VITE_SUPABASE_URL=https://vnbixduiwsvepvtybygy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_i8Axi6FQTIKNHQUiYWaHKw_PUVgNo6H
VITE_SUPABASE_PROJECT_REF=vnbixduiwsvepvtybygy
VITE_MEXO_MAIL_URL=https://mexo-mail.vercel.app
VITE_MEXO_FORMS_URL=https://mexo-forms.vercel.app
VITE_MEXO_QUIZ_URL=https://mexo-quiz.vercel.app
```

---

## 📄 License

Part of the **MEXO Ecosystem**. All rights reserved.
# mexo-quiz
