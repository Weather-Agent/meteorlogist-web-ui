# Meteorologist Web UI

A modern, interactive web application for visualizing weather data and engaging with an AI meteorologist. This React application provides a beautiful chat interface combined with an interactive map to display weather conditions across India.

## Features

- **AI-powered Weather Chat**: Ask questions about weather conditions in natural language
- **Interactive Map**: Visualize weather patterns and locations on a dynamic map
- **Resizable Interface**: Adjustable panels for optimized user experience on desktop
- **Weather Effects**: Visual representations of different weather conditions (rain, snow, fog, etc.)
- **Responsive Design**: Fully responsive layout that works on both mobile and desktop
- **City Recognition**: Automatically identifies Indian cities mentioned in queries
- **Smooth Animations**: Elegant transitions and weather effect animations

## Technology Stack

- **React 19**: Built with the latest React features and hooks
- **Vite**: Lightning-fast build tool with HMR (Hot Module Replacement)
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **OpenLayers**: Advanced map integration for geographic display
- **Radix UI Primitives**: Accessible UI components (scroll areas, buttons, inputs)
- **Lucide Icons**: Beautiful, consistent iconography

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── Chatbot.jsx      # AI chat interface component
│   │   ├── MapView.jsx      # OpenLayers map integration
│   │   └── WeatherEffects.jsx # Visual weather animations
│   ├── lib/
│   │   └── utils.js         # Utility functions
│   ├── App.jsx              # Main application component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
└── ...config files         # Various configuration files
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

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development Mode

Run the application in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` with hot module replacement enabled.

## Customization

- **Weather Effects**: Add new weather patterns in the `WeatherEffects.jsx` component
- **City Coordinates**: Extend the city database in the `MapView.jsx` component
- **UI Themes**: Modify theme colors in the `tailwind.config.js` file

## Acknowledgments

- OpenLayers for map capabilities
- Tailwind CSS for styling utilities
- React team for the powerful UI library
