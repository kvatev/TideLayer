# CLAUDE.md - TideLayer Technologies Project

## Project Overview
TideLayer Technologies corporate website built with React, TypeScript, Vite, and Tailwind CSS.
Deployed to Vercel with Supabase backend.

## Git Workflow Instructions

### Automatic Commit & Push Policy
After completing every coherent development task:

1. **Review all modified files** - Check what has changed
2. **Inspect git diff** - `git diff` and `git diff --staged`
3. **Run validation commands**:
   - TypeScript check: `npx tsc --noEmit`
   - Build check: `npm run build`
   - Lint check (if configured): `npm run lint`
4. **Check for TypeScript errors and build errors** - Must pass before committing
5. **Run `git diff --check`** - Verify no whitespace errors
6. **Inspect `git status`** - Confirm changes to be committed
7. **Verify no secrets/credentials** - No .env files, API keys, personal data, or build artifacts
8. **Stage only appropriate project changes** - Use `git add` selectively
9. **Create meaningful Git commit** - Follow Conventional Commits format
10. **Push to GitHub remote** - `git push origin main`

### Commit Message Format (Conventional Commits)
```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code restructuring
- `docs`: Documentation changes
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
- `feat: add responsive homepage sections`
- `feat: implement school inventory product page`
- `fix: correct mobile navigation dropdown`
- `style: improve education solutions layout`
- `refactor: reorganize shared UI components`
- `docs: update project documentation`

### Git Safety Rules
- ❌ Never use `git push --force`
- ❌ Never use `git reset --hard`
- ❌ Never discard user changes
- ❌ Never amend existing commits unless explicitly requested
- ❌ Never commit secrets, credentials, or .env files
- ❌ Never push broken code knowingly
- ❌ Never silently ignore failed tests/builds
- ❌ Never change remote URL without verification
- ❌ Never change default branch without explicit permission
- ❌ Never rewrite Git history

### Automatic Behavior
- Commit and push automatically after each logically completed task
- Do not ask for manual git operations after each task
- Commit after coherent tasks, not individual file changes
- If validation fails, explain failure and do not push

### Development Commands
```bash
# Development server
npm run dev

# Type checking
npx tsc --noEmit

# Production build
npm run build

# Preview production build
npm run preview
```

### Project Structure
```
src/
├── components/
│   ├── ui/          # Reusable UI primitives (Button, Card, Icon, etc.)
│   ├── layout/      # Layout components (Header, Footer, MainLayout)
│   └── sections/    # Homepage sections
├── pages/
│   ├── home/              # Homepage
│   ├── web-solutions/     # Web Solutions pages
│   ├── education-solutions/ # Education Solutions pages
│   ├── networks-it/       # Networks & IT pages
│   ├── hardware-service/  # Hardware Service page
│   ├── portfolio/         # Portfolio page
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   └── legal/             # Privacy & Terms pages
├── config/         # Brand configuration
├── data/           # Static data (services, products, FAQs)
├── utils/          # Helper functions
├── types/          # TypeScript types
└── styles/         # Global styles
```

### Key Configuration Files
- `src/config/brand.ts` - Central brand configuration (name, tagline, navigation, contact info)
- `vite.config.ts` - Vite configuration with Tailwind v4 plugin
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - Git ignore patterns

### Deployment
- **Platform**: Vercel (connected to GitHub main branch)
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Node version**: 18+

### Testing Checklist Before Commit
- [ ] `npm run build` succeeds
- [ ] `npx tsc --noEmit` passes (no TypeScript errors)
- [ ] All 18 routes accessible and render correctly
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] No console errors in browser
- [ ] Form validation works on contact page
- [ ] No secrets or credentials in code

### Future Session Protocol
When starting a new development session:
1. Pull latest changes: `git pull origin main`
2. Verify working state: `npm run build` and `npx tsc --noEmit`
3. Begin development
4. After each completed task, follow the automatic commit & push workflow above

---
*This file defines the persistent Git workflow for the TideLayer project.*