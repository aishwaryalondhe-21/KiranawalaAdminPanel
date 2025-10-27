# Admin Panel - Setup Instructions

## 📋 Quick Start Guide

Welcome to the Kiranawala Web Admin Panel project! This guide will help you get started with the development environment.

---

## 📁 Project Location

```
c:\Kiranawala\KiranawalaAndroid\
└── admin-panel/                    ← You are here
    ├── docs/                       # All documentation
    ├── README.md                   # Project overview
    └── SETUP_INSTRUCTIONS.md       # This file
```

---

## 📚 Documentation Files

All documentation is organized in the `docs/` folder:

### 1. **Start Here: ADMIN_PANEL_EXECUTIVE_SUMMARY.md**
- High-level project overview
- Business requirements
- Technology stack rationale
- Success metrics
- **Read this first if you're new to the project**

### 2. **ADMIN_PANEL_ARCHITECTURE.md**
- Complete system architecture
- Database schema documentation
- Technology stack details
- Application structure
- Authentication & security
- **Read this for technical architecture details**

### 3. **ADMIN_PANEL_IMPLEMENTATION_PLAN.md**
- 7-phase development roadmap (8-12 weeks)
- Phase-by-phase breakdown
- Feature prioritization
- Resource requirements
- Risk management
- **Read this for implementation timeline**

### 4. **ADMIN_PANEL_TECHNICAL_SPECS.md**
- Detailed technical specifications
- Database schema extensions
- API endpoints
- Component architecture
- Code examples and patterns
- **Read this for technical implementation details**

### 5. **ADMIN_PANEL_QUICK_REFERENCE.md**
- Quick lookup guide
- Technology stack summary
- API endpoints reference
- Common tasks and commands
- **Use this as a quick reference during development**

### 6. **ADMIN_PANEL_ARCHITECTURE_DIAGRAMS.md**
- Visual architecture diagrams
- Data flow diagrams
- Authentication flow
- Order management flow
- Database relationships
- **Use this for visual understanding**

---

## 🚀 Phase 1: Environment Setup (Week 1-2)

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- npm or pnpm
- Git
- Supabase account
- VS Code (recommended)

### Step 1: Verify Node.js Installation
```bash
node --version    # Should be v18 or higher
npm --version     # Should be v9 or higher
```

### Step 2: Create Next.js Project (Phase 1)
```bash
# Navigate to admin-panel folder
cd admin-panel

# Create Next.js project with TypeScript and Tailwind
npx create-next-app@latest . --typescript --tailwind --eslint

# When prompted, select:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes
# - src/ directory: No
# - App Router: Yes
# - Turbopack: No
```

### Step 3: Install Dependencies
```bash
# Install core dependencies
npm install

# Install Supabase
npm install @supabase/supabase-js

# Install state management
npm install @tanstack/react-query zustand

# Install forms and validation
npm install react-hook-form zod

# Install UI components
npm install recharts lucide-react sonner

# Install shadcn/ui
npx shadcn-ui@latest init

# When prompted, select:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

### Step 4: Environment Configuration
Create `.env.local` file in the `admin-panel/` folder:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Development settings
NEXT_PUBLIC_APP_ENV=development
```

**How to get Supabase credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and Anon Key

### Step 5: Verify Installation
```bash
# Start development server
npm run dev

# Open browser and navigate to:
# http://localhost:3000

# You should see the Next.js welcome page
```

---

## 📂 Project Structure (After Setup)

```
admin-panel/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # React components
│   └── ui/                       # shadcn/ui components
├── lib/                          # Utilities
│   └── utils.ts                  # Helper functions
├── public/                       # Static files
├── docs/                         # Documentation (6 files)
├── .env.local                    # Environment variables
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
├── README.md                     # Project overview
└── SETUP_INSTRUCTIONS.md         # This file
```

---

## 🔧 Development Workflow

### Start Development Server
```bash
npm run dev
```
- Opens at `http://localhost:3000`
- Hot reload enabled (changes auto-refresh)
- Press `Ctrl+C` to stop

### Build for Production
```bash
npm run build
npm start
```

### Run Linter
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

---

## 📖 Next Steps

### Week 1: Foundation
1. ✅ Complete environment setup (this guide)
2. Review `ADMIN_PANEL_ARCHITECTURE.md`
3. Review `ADMIN_PANEL_IMPLEMENTATION_PLAN.md`
4. Set up Supabase database schema

### Week 2: Authentication
1. Create login page UI
2. Implement Supabase authentication
3. Set up protected routes
4. Create dashboard layout

### Week 3-4: Dashboard
1. Create dashboard home page
2. Implement sidebar navigation
3. Create top navigation bar
4. Set up routing structure

---

## 🐛 Troubleshooting

### Issue: Port 3000 already in use
```bash
# Use a different port
npm run dev -- -p 3001
```

### Issue: Module not found errors
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
```

### Issue: Supabase connection errors
- Verify `.env.local` has correct credentials
- Check Supabase project is active
- Verify network connectivity

### Issue: TypeScript errors
```bash
# Rebuild TypeScript
npm run build
```

---

## 📚 Useful Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [React Query Documentation](https://tanstack.com/query)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [Supabase Dashboard](https://app.supabase.com)
- [Vercel Dashboard](https://vercel.com)

### Learning Resources
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js Tutorial](https://nextjs.org/learn)

---

## 🎯 Success Checklist

- [ ] Node.js 18+ installed
- [ ] npm/pnpm installed
- [ ] Next.js project created
- [ ] Dependencies installed
- [ ] `.env.local` configured
- [ ] Development server running
- [ ] Can access `http://localhost:3000`
- [ ] Documentation reviewed
- [ ] Supabase credentials verified

---

## 📞 Getting Help

### If you get stuck:

1. **Check the documentation**
   - Review relevant doc file in `docs/` folder
   - Check `ADMIN_PANEL_QUICK_REFERENCE.md` for quick answers

2. **Check the troubleshooting section above**
   - Most common issues are listed

3. **Review the code examples**
   - Check `ADMIN_PANEL_TECHNICAL_SPECS.md` for code examples

4. **Ask the team**
   - Slack: #admin-panel-dev
   - Email: team@kiranawala.com

---

## 🎉 You're Ready!

Once you've completed this setup, you're ready to start Phase 1 implementation:

1. Review the architecture documents
2. Set up Supabase database schema
3. Create authentication system
4. Build dashboard foundation

**Next:** Read `docs/ADMIN_PANEL_ARCHITECTURE.md` for detailed architecture information.

---

**Setup Version:** 1.0  
**Last Updated:** 2025-10-27  
**Status:** Ready for Development

