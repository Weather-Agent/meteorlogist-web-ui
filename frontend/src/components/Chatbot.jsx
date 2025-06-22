import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Send, MapPin, Plus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { sendMessageToSession, createNewSession } from "../services/weatherApi";

const INDIAN_CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Pune",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Surat",
  "Agra",
  "Varanasi",
  "Kochi",
];

const WEATHER_PHRASES = [
  "thunderstorms",
  "rain",
  "sunny weather",
  "cloud cover",
  "wind speed",
  "humidity",
  "temperature",
  "air quality",
  "fog",
  "snowfall",
  "heat wave",
  "cold front",
];

const Chatbot = ({
  onSubmit,
  showMapButton,
  showMap,
  onMapOpen,
  activeView,
}) => {
  const { user, signOut } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [placeholderText, setPlaceholderText] = useState("");
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    if (typeof signOut === "function") {
      signOut();
    }
    setShowUserMenu(false);
  };
  const handleNewSession = async () => {
    setIsProcessing(true);
    try {
      console.log("Creating new session...");
      const sessionData = await createNewSession();
      console.log("New session created successfully:", sessionData);

      // Clear the chat history when creating a new session
      setMessages([]);
      setInputValue("");

      // Show a welcome message
      setMessages([
        {
          role: "system",
          content:
            "Hello! I'm your weather assistant. How can I help you today?",
        },
      ]);
    } catch (error) {
      console.error("Failed to create new session:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: "Failed to create new session. Please try again.",
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const greeting = user?.name
      ? `Hi ${user.name}! I am your Meghdoot AI. Ask me about weather conditions from anywhere!`
      : "Hi! I am your Meghdoot AI. Ask me about weather conditions from anywhere!";
    setMessages([{ role: "system", content: greeting }]);
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomCity =
        INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
      const randomPhrase =
        WEATHER_PHRASES[Math.floor(Math.random() * WEATHER_PHRASES.length)];
      setCurrentPlaceholder(`Ask about ${randomPhrase} near ${randomCity}`);
      setTypewriterIndex(0);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typewriterIndex < currentPlaceholder.length) {
      const timeout = setTimeout(() => {
        setPlaceholderText(
          currentPlaceholder.substring(0, typewriterIndex + 1)
        );
        setTypewriterIndex(typewriterIndex + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentPlaceholder, typewriterIndex]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const userQuery = inputValue.trim();
    setInputValue("");
    setIsProcessing(true);

    const userMessage = { role: "user", content: userQuery };
    setMessages((prev) => [...prev, userMessage]);

    const thinkingMessage = { role: "system", content: "..." };
    setTimeout(() => {
      setMessages((prev) => [...prev, thinkingMessage]);
    }, 200);

    try {
      const result = await sendMessageToSession(userQuery);
      setMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1].content === "...") {
          newMessages.pop();
        }
        return [...newMessages, { role: "system", content: result.response }];
      });
      onSubmit(userQuery, result);
    } catch (error) {
      console.error("Error processing query:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1].content === "...") {
          newMessages.pop();
        }
        return [
          ...newMessages,
          {
            role: "system",
            content:
              "Sorry, I encountered an error processing your request. Please try again.",
          },
        ];
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-2 md:p-4">
      <div className="flex flex-col h-full w-full bg-gradient-to-b from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-lg shadow-lg border border-slate-700/50">
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-slate-700/50">
          <h2 className="text-xl md:text-2xl font-bold text-blue-300">
            Meghdoot AI
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleNewSession}
              variant="outline"
              className="flex items-center space-x-2 text-green-300 border-green-600/50 hover:bg-green-600/30"
              disabled={isProcessing}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">New Session</span>
            </Button>
            {user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-slate-800/80 p-2 rounded-lg border border-slate-700/70 hover:bg-slate-700/80 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="hidden md:inline">
                    {user?.name || "User"}
                  </span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-800 border border-slate-700 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-slate-300 border-b border-slate-700">
                        Signed in as{" "}
                        <span className="font-semibold text-white">
                          {user?.email}
                        </span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 px-4 py-6 md:px-10 md:py-8">
          <div className="flex flex-col space-y-4 max-w-3xl mx-auto text-base md:text-lg">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {" "}
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600/70 text-white rounded-tr-none"
                      : "bg-slate-700/70 text-slate-200 rounded-tl-none"
                  }`}
                >
                  {message.content === "..." ? (
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  ) : message.content.includes("EMERGENCY ALERT") ? (
                    <div className="flex flex-col">
                      <div className="mb-2 flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
                        <span className="text-red-400 font-bold">
                          EMERGENCY ALERT
                        </span>
                      </div>
                      <div
                        className="bg-red-900/30 p-2 rounded border border-red-500/50"
                        dangerouslySetInnerHTML={{
                          __html: message.content.replace(
                            "EMERGENCY ALERT:",
                            ""
                          ),
                        }}
                      />
                    </div>
                  ) : message.role === "system" ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-700/50 bg-slate-900/80">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto flex flex-col space-y-3"
          >
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholderText}
              className="bg-slate-800/50 border-slate-700 focus-visible:ring-blue-500/50 text-slate-200 placeholder:text-slate-400"
              disabled={isProcessing}
            />
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:justify-between">
              <div className="flex flex-wrap gap-3">
                {!showMap && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center space-x-2 text-emerald-300 border-emerald-600/50 hover:bg-emerald-600/30"
                      onClick={() => onMapOpen("map")}
                      disabled={isProcessing}
                    >
                      <MapPin className="h-5 w-5" />
                      <span>Open Map</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center space-x-2 text-purple-300 border-purple-600/50 hover:bg-purple-600/30"
                      onClick={() => onMapOpen("chart")}
                      disabled={isProcessing}
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="4" y1="20" x2="4" y2="4"></line>
                        <line x1="4" y1="20" x2="20" y2="20"></line>
                        <polyline points="4 14 8 10 12 14 20 6"></polyline>
                      </svg>
                      <span>Open Chart</span>
                    </Button>
                  </>
                )}
                {showMap && activeView === "map" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center space-x-2 text-purple-300 border-purple-600/50 hover:bg-purple-600/30"
                    onClick={() => onMapOpen("chart")}
                    disabled={isProcessing}
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="4" y1="20" x2="4" y2="4"></line>
                      <line x1="4" y1="20" x2="20" y2="20"></line>
                      <polyline points="4 14 8 10 12 14 20 6"></polyline>
                    </svg>
                    <span>Switch to Chart</span>
                  </Button>
                )}
                {showMap && activeView === "chart" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center space-x-2 text-emerald-300 border-emerald-600/50 hover:bg-emerald-600/30"
                    onClick={() => onMapOpen("map")}
                    disabled={isProcessing}
                  >
                    <MapPin className="h-5 w-5" />
                    <span>Switch to Map</span>
                  </Button>
                )}
              </div>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 sm:ml-auto"
                disabled={isProcessing}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
