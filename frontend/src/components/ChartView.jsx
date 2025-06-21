import { MapPin, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';

const ChartView = ({ query, onClose }) => {
  return (
    <div className="flex flex-col h-full w-full p-2 md:p-4">
      <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-lg shadow-lg border border-slate-700/50 overflow-hidden">
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClose()}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50 -ml-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            <h2 className="text-xl font-bold text-purple-300">
              {query ? `Chart View: ${query}` : 'Chart View'}
            </h2>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onClose('map')}
              className="text-emerald-300 border-emerald-600/50 hover:bg-emerald-600/30"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Switch to Map
            </Button>
          </div>
        </div>
        
        <div className="relative flex-1 m-3 md:m-4 overflow-hidden rounded-lg border border-slate-700/30 flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-purple-900/30">
          <div className="text-center px-4 max-w-xl mx-auto">
            <div className="bg-purple-500/20 p-6 rounded-lg border border-purple-600/30 backdrop-blur-sm mb-6">
              <h3 className="text-xl text-purple-200 font-medium mb-3">Weather Data Visualization</h3>
              <p className="text-slate-300">
                Interactive climate data graphs and trend analysis will be displayed here, showing:
              </p>
              <ul className="mt-3 space-y-2 text-slate-400">
                <li>• Temperature variations and forecasts</li>
                <li>• Precipitation patterns and predictions</li>
                <li>• Wind speed and direction trends</li>
                <li>• Historical weather data comparisons</li>
              </ul>
            </div>
            <div className="text-sm text-purple-400/70 bg-purple-500/10 px-4 py-2 rounded-full inline-block">
              🚀 Coming soon: Advanced weather analytics and insights
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartView;
