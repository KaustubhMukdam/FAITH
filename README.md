# FAITH - Finance AI Tracker & Helper 🏦✨

**F**inance **A**I **T**racker & **H**elper - A production-ready, mobile-first AI-powered finance tracker with real-time expense tracking, smart budgeting, and investment guidance built for the Indian market.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

---

## 🎯 Key Features

✅ **Real-Time Expense Tracking**: Account Aggregator + SMS parsing  
✅ **Smart Budget Rollover**: Flexible budgeting with intelligent allocation  
✅ **AI-Powered Insights**: Daily market updates & spending intelligence  
✅ **Investment Education Hub**: Research-backed, SEBI-compliant guidance  
✅ **Multi-Platform**: iOS, Android (React Native) + Web Dashboard  
✅ **RBI & SEBI Compliant**: Built with Indian regulations in mind  

---

## 📋 Monorepo Structure
```
FAITH/
├── apps/
│   ├── mobile/           # React Native iOS + Android app
│   └── web/              # Next.js admin dashboard
├── packages/
│   ├── backend/          # Node.js Express API
│   ├── shared/           # Shared types & utilities
│   └── ml-models/        # AI models (future)
├── infrastructure/       # Terraform, Kubernetes configs
├── docs/                 # Documentation
└── scripts/              # Development scripts
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Mobile** | React Native, Redux Toolkit, React Query |
| **Web** | Next.js 14, Tailwind CSS, Shadcn/ui |
| **Backend** | Node.js 20+, Express.js, TypeScript |
| **Database** | PostgreSQL 15, Redis |
| **DevOps** | GitHub Actions, Terraform, AWS |
| **External** | Account Aggregator (Finvu/Setu), Firebase, Twilio |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ ([Download](https://nodejs.org/))
- npm 9+ (comes with Node.js)
- PostgreSQL 15+ (for backend)
- Redis 6+ (for caching)

### Installation

**1. Clone repository**
```bash
git clone https://github.com/KaustubhMukdam/FAITH.git
cd FAITH
```

**2. Setup development environment**
```bash
npm run setup-dev
```

**3. Configure environment variables**

Update the following files with your credentials:
- `packages/backend/.env`
- `apps/web/.env.local`
- `apps/mobile/.env`

**4. Start all services**
```bash
npm run dev
```

Or start individual services:
```bash
npm run dev:backend   # Backend API (http://localhost:5000)
npm run dev:web       # Web Dashboard (http://localhost:3000)
npm run dev:mobile    # Mobile App (Expo)
```

---

## 📚 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [Compliance & Security](./docs/COMPLIANCE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

---

## 🧪 Testing & Quality
```bash
npm run test      # Run all tests
npm run lint      # Lint all packages
npm run format    # Format code with Prettier
npm run build     # Build all packages
```

---

## 🔧 Development Commands

**Development**
```bash
npm run dev              # Start all services in parallel
npm run dev:backend      # Backend API only
npm run dev:web          # Web dashboard only
npm run dev:mobile       # Mobile app only
```

**Database**
```bash
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data
```

**Build & Clean**
```bash
npm run build            # Build all packages
npm run clean            # Clean all artifacts
```

---

## 🏗️ Project Status

| Feature | Status |
|---------|--------|
| Core Expense Tracking | 🔨 In Development |
| Account Aggregator Integration | 📋 Planned |
| SMS Parsing | 📋 Planned |
| Smart Budgeting | 📋 Planned |
| Investment Hub | 📋 Planned |
| Mobile App | 🔨 In Development |
| Web Dashboard | 📋 Planned |

**Current Phase**: MVP Development  
**Target Launch**: Q1 2026

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🔒 Security & Compliance

FAITH is built with security and compliance at its core:

- ✅ **RBI Compliant**: Account Aggregator integration via DEPA
- ✅ **SEBI Guidelines**: Investment education (not advice)
- ✅ **Data Privacy**: GDPR + Indian DPDP Act compliant
- ✅ **Encryption**: AES-256 at rest, TLS 1.3 in transit

For security issues, please email: security@faith.app

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/KaustubhMukdam/FAITH/issues)
- **Discussions**: [GitHub Discussions](https://github.com/KaustubhMukdam/FAITH/discussions)
- **Email**: support@faith.app

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Account Aggregator framework by Sahamati
- Market data powered by Finnhub
- UI components by Shadcn/ui

---

**Built with ❤️ for the Indian fintech community**

*"Track smart. Spend wise. Invest right."*