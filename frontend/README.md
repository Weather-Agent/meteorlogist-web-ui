# 🌦️ Meteorologist Web UI

A modern, interactive web application for visualizing weather data and engaging with an AI meteorologist. This React application provides a beautiful chat interface combined with an interactive map to display weather conditions across India. ⛅🗺️

## ✨ Features

- 🤖 **AI-powered Weather Chat**: Ask questions about weather conditions in natural language
- 🗺️ **Interactive Map**: Visualize weather patterns and locations on a dynamic map
- 📱 **Resizable Interface**: Adjustable panels for optimized user experience on desktop
- 🌧️ **Weather Effects**: Visual representations of different weather conditions (rain, snow, fog, etc.)
- 💪 **Responsive Design**: Fully responsive layout that works on both mobile and desktop
- 🏙️ **City Recognition**: Automatically identifies Indian cities mentioned in queries
- ✨ **Smooth Animations**: Elegant transitions and weather effect animations

## 🛠️ Technology Stack

- ⚛️ **React 19**: Built with the latest React features and hooks
- ⚡ **Vite**: Lightning-fast build tool with HMR (Hot Module Replacement)
- 🎨 **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- 🗺️ **OpenLayers**: Advanced map integration for geographic display
- 🔒 **Civic Auth**: Secure authentication and user management
- 🎯 **Radix UI**: Accessible UI components (scroll areas, buttons, inputs)
- 🎄 **Lucide Icons**: Beautiful, consistent iconography

## 📁 Project Structure

```
frontend/
├── public/                  # Static assets
│   ├── bg.jpg              # Background image
│   ├── test-api.html       # API test page
│   └── vite.svg            # Vite logo
├── src/
│   ├── assets/             # Media assets and images
│   ├── components/
│   │   ├── ui/             # Reusable UI components
│   │   │   ├── button.jsx
│   │   │   ├── input.jsx
│   │   │   └── scroll-area.jsx
│   │   ├── AuthWall.jsx    # Authentication wrapper
│   │   ├── Chatbot.jsx     # AI chat interface
│   │   ├── ChartView.jsx   # Data visualization view
│   │   ├── LoginModal.jsx  # Auth modal component
│   │   ├── MapView.jsx     # OpenLayers map integration
│   │   ├── WeatherEffects.jsx # Visual weather effects
│   │   ├── authWall.css
│   │   └── weatherEffects.css
│   ├── contexts/
│   │   └── AuthContext.jsx # Authentication context
│   ├── lib/
│   │   └── utils.js        # Utility functions
│   ├── services/
│   │   ├── authService.js  # Auth API integration
│   │   └── weatherApi.js   # Weather API integration
│   ├── App.css             # App-specific styles
│   ├── App.jsx             # Main application component
│   ├── index.css           # Global styles
│   └── main.jsx           # Application entry point
├── .env                    # Environment variables
├── eslint.config.js        # ESLint configuration
├── index.html             # Entry HTML file
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
└── vite.config.js         # Vite configuration
```

## Key Features Explained

### Resizable Interface

The application features a draggable divider between the map and chat panels, allowing users to customize their workspace. The interface maintains a minimum width for both panels to ensure usability.

### Weather Visualization

The map component displays weather effects based on detected patterns in user queries. It includes visual representations for:
- Rain, snow, and thunderstorms
- Wind and fog effects
- Sunny and cloudy conditions
- Temperature indicators (hot/cold)

### Location Intelligence

The application can recognize Indian city names mentioned in queries and automatically centers the map on those locations with appropriate zoom levels.

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn

### 🔐 Environment Configuration

Create a `.env` file in the frontend directory with the following variables:

```env
# Required - Civic Auth Client ID
VITE_CIVIC_CLIENT_ID=your_civic_auth_client_id
```

To get your Civic Auth Client ID:
1. 🔑 Sign up at [civic.com](https://civic.com)
2. 📝 Create a new application
3. 📋 Copy your Client ID
4. 📄 Paste it in your `.env` file

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 🚀 Development Mode

Run the application in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` with hot module replacement enabled. ⚡

> 💡 **Tip**: Make sure you've set up your `.env` file before starting the development server!

## Customization

- **Weather Effects**: Add new weather patterns in the `WeatherEffects.jsx` component
- **City Coordinates**: Extend the city database in the `MapView.jsx` component
- **UI Themes**: Modify theme colors in the `tailwind.config.js` file

## Acknowledgments

- OpenLayers for map capabilities
- Tailwind CSS for styling utilities
- React team for the powerful UI library
