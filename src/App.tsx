import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Cpu, Battery, Camera, Monitor, Send, Grid3x3 } from 'lucide-react';

interface Phone {
  id: string;
  name: string;
  brand: string;
  Price: number;
  Display: {
    type: string;
    size: string;
    resolution: string;
    protection: string;
  };
  Platform: {
    chipset: string;
    OS: string;
    CPU: string;
    GPU: string;
  };
  Memory: {
    RAM: string;
    internal: string;
    storage_type: string;
    card_slot: string;
  };
  Battery: {
    type: string;
    charging: string;
  };
  Camera: {
    main: string;
    selfie: string;
  };
  Body: {
    dimensions: string;
    weight: string;
    build: string;
    sim: string;
  };
  Comms: {
    WLAN: string;
    bluetooth: string;
    GPS: string;
    NFC: string;
    radio: string;
    USB: string;
  };
  Features: string;
  Sound: {
    loudspeaker: string;
    jack: string;
  };
  Launch: {
    status: string;
  };
  Image: string;
  Tests?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  phones?: Phone[];
  responseType?: 'conversational' | 'recommendation' | 'rejection' | 'comparison';
  rationale?: string;
}

export default function AISearchInterface() {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT
  const API_KEY = import.meta.env.VITE_API_KEY

  const FETCH_ALL = `${API_BASE_URL}/phones`; // PHONE DATA ENDPOINT
  const GEMINI_URL = `${API_BASE_URL}/search`; // GEMINI ENDPOINT

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearchActive(true);
    setIsLoading(true);
    setError('');

    const userMessage: Message = { role: 'user', content: searchQuery };
    setMessages(prev => [...prev, userMessage]);

    try {
      const history = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({ 
          query: searchQuery,
          history: history 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const sortedData = data.phones ? data.phones.sort((a: Phone, b: Phone) => a.Price - b.Price) : [];
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.explanation || data.response || 'Here are the phones matching your query:',
        phones: sortedData.phones || [],
        responseType: data.response_type || 'conversational',
        rationale: data.rationale || ''
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setSearchQuery('');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process search');
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        phones: []
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowAllPhones = async () => {
    setIsSearchActive(true);
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(FETCH_ALL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      const sortedData = data.sort((a: Phone, b: Phone) => a.Price - b.Price);
      
      const message: Message = {
        role: 'assistant',
        content: `Here's our complete collection of ${sortedData.length} smartphones. Browse through our catalog to find your perfect match!`,
        phones: sortedData,
        responseType: 'recommendation'
      };
      
      setMessages([message]);
    } catch (err) {
      console.error('Error fetching phones:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch phones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const extractMainSpecs = (phone: Phone) => {
    const ramMatch = phone.Memory?.internal?.match(/(\d+GB)\s+RAM/);
    const ram = ramMatch ? ramMatch[1] : phone.Memory?.RAM || 'N/A';
    
    const storageMatch = phone.Memory?.internal?.match(/^(\d+GB)/);
    const storage = storageMatch ? storageMatch[1] : 'N/A';
    
    return { ram, storage };
  };

  return (
    <div className="min-h-screen transition-colors duration-700 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className={`transition-all duration-700 ${
        isSearchActive 
          ? 'pt-6 sticky top-0 z-40 bg-gradient-to-b from-gray-900/98 via-purple-900/95 to-transparent backdrop-blur-xl border-b border-purple-500/20' 
          : 'flex items-center justify-center min-h-screen'
      }`}>
        <div className={`transition-all duration-700 ${
          isSearchActive ? 'w-full px-6 pb-4' : 'w-full max-w-3xl px-6'
        }`}>
          {!isSearchActive && (
            <div className="text-center mb-12 animate-fade-in">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-12 h-12 text-purple-400 animate-pulse" />
                <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                  AI Phone Assistant
                </h1>
              </div>
              <p className="text-xl text-gray-300">
                Ask me anything about phones - from technical specs to buying advice!
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {[
                  "Best camera phone under ₹30,000?",
                  "Compact Android with good one-hand use",
                  "Compare Pixel 8a vs OnePlus 12R",
                  "Battery king with fast charging, around ₹15k",
                  "Explain OIS vs EIS",
                  "Show me Samsung phones only, under ₹25k"
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(example);
                      setTimeout(handleSearch, 100);
                    }}
                    className="text-left px-4 py-3 rounded-xl bg-gray-800/40 border border-purple-500/30 text-gray-300 hover:bg-gray-800/60 hover:border-purple-500/50 transition-all text-sm"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative transition-all duration-700">
            <div className={`absolute inset-0 rounded-2xl transition-all duration-700 ${
              isSearchActive 
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-50 blur-lg' 
                : 'bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-50 blur-2xl'
            } animate-pulse`} />
            
            <div className="relative backdrop-blur-xl rounded-2xl transition-all duration-700 bg-gray-800/80 border border-purple-500/30 shadow-2xl">
              <div className="flex items-center gap-3 p-4">
                <Search className="w-5 h-5 flex-shrink-0 text-purple-400" />
                
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me: 'What is OIS vs EIS?' or 'Best gaming phone under 60k?'..."
                  className="flex-1 bg-transparent text-base outline-none text-white placeholder-gray-400"
                />

                
                <button onClick={handleShowAllPhones} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-400/50 text-purple-200 hover:bg-purple-500/30 transition-colors text-sm">
                <Grid3x3 className="w-4 h-4" /> Catalog </button>
            

                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isLoading}
                  className="p-2 rounded-lg bg-purple-500/20 border border-purple-400/50 text-purple-200 hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSearchActive && (
        <div className="px-6 pb-12 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="mb-6 rounded-2xl p-6 backdrop-blur-xl bg-red-900/20 border border-red-500/20">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="text-lg font-semibold text-red-300">Error</h3>
                    <p className="text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className="mb-8">
                <div className={`flex items-start gap-4 mb-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-3xl rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-purple-500/20 border border-purple-400/50 text-white'
                      : 'bg-gray-800/60 border border-purple-500/20 text-gray-200'
                  }`}>
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    {message.rationale && message.role === 'assistant' && (
                      <div className="mt-3 pt-3 border-t border-purple-500/20">
                        <p className="text-sm text-purple-300 flex items-start gap-2">
                          <span className="text-purple-400 font-semibold">💡 Why:</span>
                          <span className="text-gray-400">{message.rationale}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">You</span>
                    </div>
                  )}
                </div>

                {message.phones && message.phones.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                    {message.phones.map((phone) => {
                      const { ram, storage } = extractMainSpecs(phone);
                      return (
                        <div
                          key={phone.id}
                          onClick={() => setSelectedPhone(phone)}
                          className="group relative backdrop-blur-xl rounded-2xl bg-gray-800/60 border border-purple-500/20 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 cursor-pointer"
                        >
                          <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                            {phone.Image ? (
                              <>
                                <img 
                                  src={phone.Image}
                                  alt={phone.name} 
                                  className="absolute inset-0 w-full h-full object-contain p-4"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="hidden absolute inset-0 flex items-center justify-center">
                                  <div className="text-6xl opacity-20">📱</div>
                                </div>
                              </>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-6xl opacity-20">📱</div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
                            
                            <div className="absolute top-3 right-3 px-3 py-1 rounded-full backdrop-blur-md bg-purple-500/30 border border-purple-400/50">
                              <span className="text-xs font-semibold text-purple-200">{phone.brand}</span>
                            </div>
                          </div>

                          <div className="p-5">
                            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                              {phone.name}
                            </h3>
                            
                            <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                                {formatPrice(phone.Price)}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-sm text-gray-400">
                              <div className="flex items-center gap-2">
                                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                                <span className="line-clamp-1">{phone.Platform?.chipset || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Monitor className="w-3.5 h-3.5 text-purple-400" />
                                <span>{ram} + {storage}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Battery className="w-3.5 h-3.5 text-purple-400" />
                                <span className="line-clamp-1">{phone.Battery?.type || 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white animate-spin" />
                </div>
                <div className="backdrop-blur-xl rounded-2xl p-4 bg-gray-800/60 border border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-gray-300 ml-2">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {selectedPhone && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedPhone(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-purple-500/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhone(null)}
              className="sticky top-4 right-4 float-right m-4 p-2 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-200 hover:bg-purple-500/30 transition-colors z-10"
            >
              ✕
            </button>

            <div className="p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="flex-shrink-0 w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                  {selectedPhone.Image ? (
                    <img 
                      src={selectedPhone.Image}
                      alt={selectedPhone.name}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.innerHTML = '<div class="text-5xl">📱</div>';
                        }
                      }}
                    />
                  ) : (
                    <div className="text-5xl">📱</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-200 text-sm mb-2">
                    {selectedPhone.brand}
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedPhone.name}</h2>
                  <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    {formatPrice(selectedPhone.Price)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Monitor className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">Display</h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><span className="text-purple-300">Type:</span> {selectedPhone.Display?.type}</p>
                      <p><span className="text-purple-300">Size:</span> {selectedPhone.Display?.size}</p>
                      <p><span className="text-purple-300">Resolution:</span> {selectedPhone.Display?.resolution}</p>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Cpu className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">Performance</h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><span className="text-purple-300">Chipset:</span> {selectedPhone.Platform?.chipset}</p>
                      <p><span className="text-purple-300">CPU:</span> {selectedPhone.Platform?.CPU}</p>
                      <p><span className="text-purple-300">GPU:</span> {selectedPhone.Platform?.GPU}</p>
                      <p><span className="text-purple-300">OS:</span> {selectedPhone.Platform?.OS}</p>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Battery className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">Battery</h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><span className="text-purple-300">Type:</span> {selectedPhone.Battery?.type}</p>
                      <p><span className="text-purple-300">Charging:</span> {selectedPhone.Battery?.charging}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Camera className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">Camera</h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><span className="text-purple-300">Main:</span> {selectedPhone.Camera?.main}</p>
                      <p><span className="text-purple-300">Selfie:</span> {selectedPhone.Camera?.selfie}</p>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/10">
                    <h3 className="text-lg font-semibold text-white mb-3">Memory</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><span className="text-purple-300">RAM:</span> {selectedPhone.Memory?.RAM}</p>
                      <p><span className="text-purple-300">Internal:</span> {selectedPhone.Memory?.internal}</p>
                      <p><span className="text-purple-300">Type:</span> {selectedPhone.Memory?.storage_type}</p>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/10">
                    <h3 className="text-lg font-semibold text-white mb-3">Body</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><span className="text-purple-300">Dimensions:</span> {selectedPhone.Body?.dimensions}</p>
                      <p><span className="text-purple-300">Weight:</span> {selectedPhone.Body?.weight}</p>
                      <p><span className="text-purple-300">Build:</span> {selectedPhone.Body?.build}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-purple-400 opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-100px) translateX(50px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float linear infinite; }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
      `}</style>
    </div>
  );
}