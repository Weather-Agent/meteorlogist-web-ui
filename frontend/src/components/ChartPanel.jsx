import { useState, useRef, useEffect } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { ChevronUp, ChevronDown, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { Button } from './ui/button';

const ChartPanel = ({ onCityClick }) => {
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed to not hide map
  const [panelHeight, setPanelHeight] = useState(300); // Default height
  const [isDragging, setIsDragging] = useState(false);
  const [activeChart, setActiveChart] = useState('bar');
  const dragRef = useRef(null);
  const panelRef = useRef(null);

  // Adjust panel height when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (isExpanded && panelRef.current) {
        const mapContainer = panelRef.current?.parentElement;
        if (mapContainer) {
          const mapHeight = mapContainer.clientHeight || 600;
          const maxHeight = Math.floor(mapHeight * 0.6);
          if (panelHeight > maxHeight) {
            setPanelHeight(maxHeight);
          }
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded, panelHeight]);

  // Dummy data for Indian cities population
  const chartHeight = Math.max(200, panelHeight - 160); // More conservative height calculation
  const indianCitiesData = {
    xAxis: [
      {
        scaleType: 'band',
        data: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad']
      }
    ],
    series: [
      {
        data: [12.5, 11.0, 8.4, 6.9, 4.7, 4.5, 3.1, 5.6],
        label: 'Population (Million)',
        color: '#8B5CF6'
      }
    ],
    width: 600,
    height: chartHeight
  };

  // Dummy data for temperature trends
  const temperatureData = {
    xAxis: [{ data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }],
    series: [
      {
        data: [15, 18, 22, 28, 34, 38, 35, 33, 29, 24, 19, 16],
        label: 'Avg Temperature (°C)',
        area: true,
        color: '#06B6D4'
      },
      {
        data: [8, 10, 15, 22, 28, 32, 30, 28, 24, 18, 12, 9],
        label: 'Max Temperature (°C)',
        color: '#F59E0B'
      }
    ],
    width: 600,
    height: chartHeight
  };

  // City coordinates for map interaction
  const cityCoordinates = {
    'Mumbai': [72.8777, 19.0760],
    'Delhi': [77.1025, 28.7041],
    'Bangalore': [77.5946, 12.9716],
    'Hyderabad': [78.4867, 17.3850],
    'Chennai': [80.2707, 13.0827],
    'Kolkata': [88.3639, 22.5726],
    'Pune': [73.8567, 18.5204],
    'Ahmedabad': [72.5714, 23.0225]
  };

  const handleBarClick = (event, datapoint) => {
    if (datapoint && datapoint.dataIndex !== undefined) {
      const cityName = indianCitiesData.xAxis[0].data[datapoint.dataIndex];
      const coordinates = cityCoordinates[cityName];
      if (coordinates && onCityClick) {
        onCityClick(cityName, coordinates);
      }
    }
  };

  const handleDragStart = (e) => {
    // Prevent the event from affecting other components
    e.stopPropagation();
    
    setIsDragging(true);
    const startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    const startHeight = panelHeight;
    
    // Get the map container height to set a proper max height
    const mapContainer = panelRef.current?.parentElement;
    const mapHeight = mapContainer?.clientHeight || 600;
    const maxPanelHeight = Math.floor(mapHeight * 0.6); // Max 60% of map container

    const handleDrag = (e) => {
      // Prevent the drag from affecting other elements
      e.preventDefault();
      e.stopPropagation();
      
      const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
      const deltaY = startY - currentY;
      const newHeight = Math.max(200, Math.min(maxPanelHeight, startHeight + deltaY));
      setPanelHeight(newHeight);
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('touchend', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDrag, { passive: false });
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDrag, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  };

  return (
    <div 
      ref={panelRef}
      className={`absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 shadow-2xl transition-all duration-300 flex flex-col ${
        isExpanded ? 'z-10' : 'z-5'
      }`}
      style={{ 
        height: isExpanded ? `${panelHeight}px` : '60px',
        transform: isExpanded ? 'translateY(0)' : 'translateY(calc(100% - 60px))',
        maxHeight: '60%', // Reduce max height to ensure bottom content is visible
        pointerEvents: 'auto', // Always keep pointer events active
        isolation: 'isolate', // Create a new stacking context
        position: 'absolute' // Reinforce absolute positioning
      }}
    >
      {/* Drag handle */}
      <div
        ref={dragRef}
        className="w-full h-5 cursor-ns-resize flex items-center justify-center bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{ touchAction: 'none' }}
      >
        <div className="w-20 h-1.5 bg-slate-400 rounded-full"></div>
      </div>

      {/* Header - Always visible */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50 bg-slate-800/70">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-300 hover:text-white hover:bg-slate-700/50"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
          <h3 className="text-lg font-semibold text-purple-300">
            Weather Analytics Dashboard
          </h3>
          {!isExpanded && (
            <span className="text-sm text-slate-400">Click to expand charts</span>
          )}
        </div>
        
        {isExpanded && (
          <div className="flex space-x-2">
            <Button
              variant={activeChart === 'bar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveChart('bar')}
              className={`${
                activeChart === 'bar' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Population
            </Button>
            <Button
              variant={activeChart === 'line' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveChart('line')}
              className={`${
                activeChart === 'line' 
                  ? 'bg-cyan-600 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LineChartIcon className="h-4 w-4 mr-1" />
              Temperature
            </Button>
          </div>
        )}
      </div>

      {/* Chart Content */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ maxHeight: `${panelHeight - 100}px` }}>
          <div className="p-4">
            {activeChart === 'bar' ? (
              <div className="bg-slate-800/60 p-4 rounded-lg border border-purple-600/30 backdrop-blur-sm">
                <h4 className="text-lg text-purple-200 font-medium mb-3">
                  Indian Cities Population (Click to zoom on map)
                </h4>
                <div className="overflow-x-auto">
                  <BarChart
                    {...indianCitiesData}
                    onItemClick={handleBarClick}
                    sx={{
                      '& .MuiChartsAxis-root': {
                        '& .MuiChartsAxis-tickLabel': {
                          fill: '#E5E7EB'
                        },
                        '& .MuiChartsAxis-line': {
                          stroke: '#6B7280'
                        },
                        '& .MuiChartsAxis-tick': {
                          stroke: '#6B7280'
                        }
                      },
                      '& .MuiChartsGrid-root': {
                        '& .MuiChartsGrid-line': {
                          stroke: '#374151',
                          strokeOpacity: 0.3
                        }
                      },
                      '& .MuiChartsLegend-root': {
                        '& .MuiChartsLegend-label': {
                          fill: '#E5E7EB'
                        }
                      },
                      cursor: 'pointer'
                    }}
                  />
                </div>
                <p className="text-sm text-purple-400/70 mt-2">
                  💡 Click on any bar to zoom to that city on the map
                </p>
              </div>
            ) : (
              <div className="bg-slate-800/60 p-4 rounded-lg border border-cyan-600/30 backdrop-blur-sm">
                <h4 className="text-lg text-cyan-200 font-medium mb-3">
                  Monthly Temperature Trends Across India
                </h4>
                <div className="overflow-x-auto">
                  <LineChart
                    {...temperatureData}
                    grid={{ vertical: true, horizontal: true }}
                    sx={{
                      '& .MuiChartsAxis-root': {
                        '& .MuiChartsAxis-tickLabel': {
                          fill: '#E5E7EB'
                        },
                        '& .MuiChartsAxis-line': {
                          stroke: '#6B7280'
                        },
                        '& .MuiChartsAxis-tick': {
                          stroke: '#6B7280'
                        }
                      },
                      '& .MuiChartsGrid-root': {
                        '& .MuiChartsGrid-line': {
                          stroke: '#374151',
                          strokeOpacity: 0.3
                        }
                      },
                      '& .MuiChartsLegend-root': {
                        '& .MuiChartsLegend-label': {
                          fill: '#E5E7EB'
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-sm text-cyan-400/70 mt-2">
                  📊 Temperature variations showing seasonal patterns
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ChartPanel;
