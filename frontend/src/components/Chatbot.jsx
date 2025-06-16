import { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Send, MapPin } from 'lucide-react';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Ahmedabad', 'Pune', 'Jaipur', 'Lucknow',
  'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
  'Visakhapatnam', 'Surat', 'Agra', 'Varanasi', 'Kochi'
];

const WEATHER_PHRASES = [
  'thunderstorms', 'rain', 'sunny weather', 'cloud cover',
  'wind speed', 'humidity', 'temperature', 'air quality',
  'fog', 'snowfall', 'heat wave', 'cold front'
];

const Chatbot = ({ onSubmit, showMapButton, onMapOpen }) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Hi! I am your AI Meteorologist. Ask me about weather conditions from anywhere!' }
  ]);
  const [placeholderText, setPlaceholderText] = useState('');
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomCity = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
      const randomPhrase = WEATHER_PHRASES[Math.floor(Math.random() * WEATHER_PHRASES.length)];
      setCurrentPlaceholder(`Ask about ${randomPhrase} near ${randomCity}`);
      setTypewriterIndex(0);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typewriterIndex < currentPlaceholder.length) {
      const timeout = setTimeout(() => {
        setPlaceholderText(currentPlaceholder.substring(0, typewriterIndex + 1));
        setTypewriterIndex(typewriterIndex + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentPlaceholder, typewriterIndex]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages([...messages, userMessage]);

    setTimeout(() => {
      const systemMessage = {
        role: 'system',
        content: `Analyzing weather patterns for your query: "${inputValue}"`
      };
      setMessages(prev => [...prev, systemMessage]);
      onSubmit(inputValue);
    }, 500);

    setInputValue('');
  };  return (
    <div className="flex flex-col h-full w-full p-2 md:p-4">
      <div className="flex flex-col h-full w-full bg-gradient-to-b from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-lg shadow-lg border border-slate-700/50">
        
        <div className="p-3 md:p-4 border-b border-slate-700/50">
          <h2 className="text-xl md:text-2xl font-bold text-blue-300 pl-5">AI Meteorologist</h2>
        </div>

      <ScrollArea className="flex-1 px-4 py-6 md:px-10 md:py-8">
        <div className="flex flex-col space-y-4 max-w-3xl mx-auto text-base md:text-lg">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600/70 text-white rounded-tr-none'
                    : 'bg-slate-700/70 text-slate-200 rounded-tl-none'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-slate-700/50 bg-slate-900/80">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col space-y-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholderText}
            className="bg-slate-800/50 border-slate-700 focus-visible:ring-blue-500/50 text-slate-200 placeholder:text-slate-400"
          />

          <div className="flex justify-between">
            {showMapButton && (
              <Button
                type="button"
                variant="outline"
                className="flex items-center space-x-2 text-emerald-300 border-emerald-600/50 hover:bg-emerald-600/30"
                onClick={onMapOpen}
              >
                <MapPin className="h-5 w-5" />
                <span>Open Map</span>
              </Button>
            )}

            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 ml-auto">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>      </div>
    </div>
    </div>
  );
};

export default Chatbot;
