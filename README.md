# TON Mystery Cases

A modern Telegram Web App for opening mystery cases and winning TON cryptocurrency. Built with Next.js, TypeScript, and TON Connect.

## Features

- 🎁 **Mystery Cases**: Open different tiers of cases to win TON rewards
- 💎 **TON Wallet Integration**: Connect your TON wallet for deposits and withdrawals
- 📦 **Inventory System**: Track your winnings and manage your items
- 👥 **Referral System**: Earn 10% from friends' deposits
- 📱 **Telegram Integration**: Native Telegram Web App experience
- 🎨 **Modern UI**: Glass morphism design with smooth animations

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI components
- **Blockchain**: TON Connect for wallet integration
- **State Management**: React hooks with localStorage fallback
- **Backend API**: RESTful API with fallback to local storage

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Telegram Bot Token (for production)
- TON wallet for testing

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd ton-mystery-cases
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Update the environment variables:
\`\`\`env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

5. Update the TON Connect manifest:
- Edit `public/tonconnect-manifest.json`
- Replace `your-app-domain.vercel.app` with your actual domain

6. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with fonts and providers
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── cases/            # Case-related components
│   ├── inventory/        # Inventory management
│   ├── profile/          # User profile components
│   ├── referral/         # Referral system
│   ├── wallet/           # TON wallet integration
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── api.ts           # Backend API client
│   ├── cases.ts         # Case logic and rewards
│   ├── telegram.ts      # Telegram Web App integration
│   ├── ton-wallet.ts    # TON wallet management
│   └── utils.ts         # General utilities
├── types/               # TypeScript type definitions
└── public/             # Static assets
    └── tonconnect-manifest.json  # TON Connect configuration
\`\`\`

## Key Components

### Case System
- **CasesGrid**: Main interface for opening cases
- **CaseCard**: Individual case display with pricing and rewards
- **CaseOpeningAnimation**: Animated case opening experience

### Wallet Integration
- **TonConnectProvider**: TON Connect context provider
- **WalletButton**: Connect/disconnect wallet interface
- **WalletOperations**: Deposit and withdrawal functionality

### User Management
- **UserProfile**: User stats and information display
- **InventoryGrid**: Item management and display
- **TransactionHistory**: Transaction tracking

### Referral System
- **ReferralSystem**: Complete referral management interface

## Configuration

### TON Connect Setup

1. Update `public/tonconnect-manifest.json`:
\`\`\`json
{
  "url": "https://your-domain.com",
  "name": "TON Mystery Cases",
  "iconUrl": "https://your-domain.com/icon-192x192.png"
}
\`\`\`

### Backend Integration

The app supports both backend API and local storage fallback:

- **With Backend**: Full functionality with user persistence
- **Local Storage**: Demo mode with client-side state management

### Telegram Bot Setup

1. Create a bot with @BotFather
2. Set up Web App URL in bot settings
3. Configure webhook for deposit notifications (optional)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Manual Deployment

1. Build the project:
\`\`\`bash
npm run build
\`\`\`

2. Start the production server:
\`\`\`bash
npm start
\`\`\`

## Environment Variables

\`\`\`env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api

# Development redirect URL for Supabase (if using)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Optional: Analytics and monitoring
VERCEL_ANALYTICS_ID=your-analytics-id
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Open an issue on GitHub
- Contact via Telegram: @your_support_bot
