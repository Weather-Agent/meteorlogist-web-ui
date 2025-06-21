import { MapPin, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import geocodingService from '../services/geocodingService';

const ChartView = ({ query, onClose }) => {
  // Dummy weather data for demonstration
  const temperatureData = {
    xAxis: [{ data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }],
    series: [
      {
        data: [5, 8, 12, 18, 23, 28, 32, 30, 25, 18, 10, 6],
        label: 'Temperature (°C)',
        area: true,
        color: '#8B5CF6'
      }
    ]
  };

  const precipitationData = {
    xAxis: [{ data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }],
    series: [
      {
        data: [45, 38, 42, 55, 68, 85, 95, 88, 75, 62, 50, 47],
        label: 'Precipitation (mm)',
        color: '#06B6D4'
      }
    ]
  };

  const windSpeedData = {
    xAxis: [{ data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }],
    series: [
      {
        data: [12, 15, 18, 22, 19, 16, 14, 17, 20, 25, 18, 13],
        label: 'Wind Speed (km/h)',
        curve: 'catmullRom',
        color: '#10B981'
      }
    ]
  };

  const multiSeriesData = {
    xAxis: [{ 
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      label: 'Month'
    }],
    series: [
      {
        data: [5, 8, 12, 18, 23, 28, 32, 30, 25, 18, 10, 6],
        label: 'Temperature (°C)',
        color: '#8B5CF6'
      },
      {
        data: [2, 4, 6, 9, 12, 15, 17, 16, 13, 9, 5, 3],
        label: 'Humidity (%/10)',
        color: '#F59E0B'
      },
      {
        data: [8, 10, 12, 15, 13, 11, 9, 11, 13, 16, 12, 9],
        label: 'Wind Speed (km/h)',
        color: '#10B981'
      }
    ]
  };

  // City data for bar chart
  const cityPopulationData = {
    xAxis: [
      {
        scaleType: 'band',
        data: ['Tokyo', 'Delhi', 'Shanghai', 'São Paulo', 'Mexico City', 'Cairo', 'Mumbai', 'Beijing']
      }
    ],
    series: [
      {
        data: [37.4, 30.3, 27.1, 22.0, 21.8, 20.9, 20.4, 19.6],
        label: 'Population (Million)',
        color: '#8B5CF6'
      }
    ]
  };

  // Handle bar chart click
  const handleBarClick = async (event, datapoint) => {
    if (datapoint && datapoint.dataIndex !== undefined) {
      const cityName = cityPopulationData.xAxis[0].data[datapoint.dataIndex];
      console.log('Clicked on city:', cityName);
      
      try {
        // Get coordinates using geocoding API
        const locationData = await geocodingService.getCoordinates(cityName);
        
        if (locationData) {
          console.log('Location data:', locationData);
          // Switch to map view with the location
          onClose('map', {
            location: cityName,
            coordinates: [locationData.longitude, locationData.latitude],
            details: {
              name: locationData.name,
              country: locationData.country,
              population: locationData.population,
              timezone: locationData.timezone
            }
          });
        } else {
          console.warn('No location data found for:', cityName);
        }
      } catch (error) {
        console.error('Error getting location data:', error);
      }
    }
  };

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
        
        <div className="relative flex-1 m-3 md:m-4 overflow-hidden rounded-lg border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-purple-900/30">
          <div className="p-4 h-full overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Temperature Chart */}
              <div className="bg-slate-800/60 p-4 rounded-lg border border-purple-600/30 backdrop-blur-sm">
                <h3 className="text-lg text-purple-200 font-medium mb-3">Monthly Temperature Trends</h3>
                <div className="h-80">
                  <LineChart
                    {...temperatureData}
                    height={300}
                    grid={{ vertical: true, horizontal: true }}
                    margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
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
                      }
                    }}
                  />
                </div>
              </div>

              {/* City Population Bar Chart */}
              <div className="bg-slate-800/60 p-4 rounded-lg border border-cyan-600/30 backdrop-blur-sm">
                <h3 className="text-lg text-cyan-200 font-medium mb-3">Global Cities Population (Click to Navigate)</h3>
                <div className="h-80">
                  <BarChart
                    {...cityPopulationData}
                    height={300}
                    grid={{ vertical: true, horizontal: true }}
                    margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
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
                      cursor: 'pointer'
                    }}
                  />
                </div>
                <p className="text-sm text-cyan-400/70 mt-2">
                  💡 Click on any bar to navigate to that city on the map
                </p>
              </div>

              {/* Wind Speed Chart */}
              <div className="bg-slate-800/60 p-4 rounded-lg border border-emerald-600/30 backdrop-blur-sm">
                <h3 className="text-lg text-emerald-200 font-medium mb-3">Wind Speed Patterns</h3>
                <div className="h-80">
                  <LineChart
                    {...windSpeedData}
                    height={300}
                    grid={{ vertical: true, horizontal: true }}
                    margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
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
                      }
                    }}
                  />
                </div>
              </div>

              {/* Multi-series Chart */}
              <div className="bg-slate-800/60 p-4 rounded-lg border border-amber-600/30 backdrop-blur-sm">
                <h3 className="text-lg text-amber-200 font-medium mb-3">Weather Overview</h3>
                <div className="h-80">
                  <LineChart
                    {...multiSeriesData}
                    height={300}
                    grid={{ vertical: true, horizontal: true }}
                    margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
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
              </div>

              {/* City Population Chart */}
              <div className="bg-slate-800/60 p-4 rounded-lg border border-indigo-600/30 backdrop-blur-sm">
                <h3 className="text-lg text-indigo-200 font-medium mb-3">City Population (Bar Chart)</h3>
                <div className="h-80">
                  <BarChart
                    {...cityPopulationData}
                    height={300}
                    margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
                    onClick={handleBarClick}
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
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartView;
