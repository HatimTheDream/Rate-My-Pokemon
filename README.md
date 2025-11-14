# 🎮 Rate My Pokémon

A beautiful, interactive Pokédex where you can rate and track your favorite Pokémon across all generations!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)

## ✨ Features

### 🎨 Beautiful UI
- **Gamified Filters**: Intuitive, colorful filter controls with live Pokémon counts
- **Type Badges**: Gradient badges for all 18 Pokémon types with selection effects
- **Category Cards**: Collectible-style cards for Legendary, Mythical, Pseudo-Legendary, and Mega Pokémon
- **Responsive Grid**: Dense card layout that adapts to screen size
- **Smooth Animations**: Float effects, shine overlays, and scale transitions

### 📊 Rating System
- **10-Star Rating**: Rate each Pokémon on a scale of 1-10
- **Persistent Storage**: Ratings saved to Supabase and local storage
- **Rating History**: Track rating changes over time with interactive charts
- **Shiny Variants**: Separate ratings for shiny forms

### 🔍 Advanced Filtering
- **Type Filter**: Filter by one or multiple types (AND logic)
- **Generation Filter**: Browse Pokémon by generation (Gen 1-9)
- **Category Filter**: Filter by Legendary, Mythical, Pseudo-Legendary, or Mega
- **Search**: Find Pokémon by name or Pokédex number
- **Sort Options**: Sort by Coolness, Name, Dex #, Generation, or Region

### 🔐 Authentication
- **Google OAuth**: Sign in with your Google account
- **User Profiles**: Avatar and email display in toolbar
- **Cloud Sync**: Ratings sync across devices when signed in

### 🧬 Evolution Trees
- **Interactive Trees**: View complete evolution chains
- **Mega Evolution Support**: Always shows mega forms regardless of stage
- **Smart Deduplication**: Prevents duplicate mega entries
- **Badge Labels**: Clear MEGA badges on mega evolution nodes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for authentication)
- Google Cloud account (for OAuth)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rate-my-pokemon.git
cd rate-my-pokemon

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Environment Setup

Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Google OAuth Setup

**Quick Guide:** See `QUICKSTART_AUTH.md` for a 5-minute setup  
**Full Guide:** See `GOOGLE_OAUTH_SETUP.md` for detailed instructions

1. Create OAuth client in Google Cloud Console
2. Enable Google provider in Supabase
3. Add credentials to `.env`
4. Restart dev server

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5174](http://localhost:5174) in your browser.

## 📁 Project Structure

```
rate-my-pokemon/
├── src/
│   ├── components/          # React components
│   │   ├── Atoms.tsx       # Basic UI components
│   │   ├── AuthModal.tsx   # Authentication modal
│   │   ├── EvoTree.tsx     # Evolution tree viewer
│   │   ├── Filters.tsx     # Filter controls
│   │   ├── LineChart.tsx   # Rating history chart
│   │   ├── PokedexChrome.tsx  # UI chrome/header
│   │   ├── PokemonCard.tsx    # Pokémon grid card
│   │   ├── PokemonPage.tsx    # Detail view
│   │   └── Toolbar.tsx        # Top toolbar
│   ├── lib/                # Utilities & services
│   │   ├── auth.ts         # Google OAuth logic
│   │   ├── hooks.ts        # Custom React hooks
│   │   ├── pokemon.ts      # PokéAPI integration
│   │   ├── supabase.ts     # Supabase client
│   │   └── utils.ts        # Helper functions
│   ├── __tests__/          # Component tests
│   ├── App.tsx             # Main app component
│   ├── index.css           # Global styles
│   └── main.tsx            # App entry point
├── supabase/
│   └── migrations/         # Database schema
├── scripts/
│   └── clean-src-js.js     # Build cleanup
├── .env.example            # Environment template
├── QUICKSTART_AUTH.md      # Fast OAuth setup
├── GOOGLE_OAUTH_SETUP.md   # Detailed OAuth guide
└── package.json
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + Custom CSS
- **Data Source**: PokéAPI
- **Authentication**: Supabase Auth (Google OAuth)
- **Database**: Supabase (PostgreSQL)
- **Testing**: Vitest + React Testing Library

## 🎯 Key Features Explained

### Filter System
The gamified filter panel includes:
- **Type badges** with gradient backgrounds matching each type's color
- **Generation pills** for quick filtering by Pokémon generation
- **Category cards** with emoji icons for special categories
- **Live count badges** showing how many Pokémon match each filter
- **Visual selection states** with scale, glow, and color changes

### Rating Persistence
- Ratings saved to both **Supabase** (when signed in) and **localStorage** (always)
- Shiny variants use negative Pokédex numbers as a temporary storage hack
- Rating events tracked over time for historical analysis

### Evolution Chains
- Fetches complete evolution data from PokéAPI
- Dynamically adds mega evolutions from species varieties
- Deduplicates entries to prevent showing the same Pokémon twice
- Responsive sizing adjusts to screen width

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🏗️ Build

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Kill any node processes
Get-Process -Name 'node' -ErrorAction SilentlyContinue | Stop-Process -Force

# Restart dev server
npm run dev
```

### Google Sign-In Not Working
1. Check that Google provider is enabled in Supabase
2. Verify Client ID and Secret are correct
3. Ensure redirect URIs match exactly in Google Cloud
4. Check browser console for specific error messages

### Ratings Not Saving
1. Verify you're signed in (avatar in top-right)
2. Check browser console for Supabase errors
3. Ensure database tables exist (see migrations)
4. Check RLS policies in Supabase

### Tailwind Warnings
These are cosmetic linting warnings and don't affect functionality. The `.stylelintrc.json` and `.vscode/settings.json` files should suppress them.

## 📝 Database Schema

### user_ratings
```sql
CREATE TABLE user_ratings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  pokemon_dex INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pokemon_dex)
);
```

### rating_events
```sql
CREATE TABLE rating_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  pokemon_dex INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎨 Design System

The app uses a custom Pokédex-inspired design system with:
- **CSS Variables**: Defined in `:root` for consistent theming
- **Type Gradients**: Each Pokémon type has a unique gradient
- **Animations**: Float, shimmer, shine, and scale effects
- **Responsive**: Mobile-first design with breakpoints

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **PokéAPI** - For comprehensive Pokémon data
- **Pokémon Showdown** - For sprite assets
- **Supabase** - For authentication and database
- **The Pokémon Company** - For creating the Pokémon franchise

## 📧 Contact

Have questions or feedback? Open an issue on GitHub!

---

Made with ❤️ by Pokémon trainers, for Pokémon trainers
