
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Sparkles, ChevronRight, Zap, Activity, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { searchKnowledgeBase } from '@/lib/knowledgeBase';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'assistant', text: 'Hello! I am your Retail Intelligence Assistant. I can help you with status updates, diagnostics, and recommended actions based on where you are in the platform.' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    // --- CONTEXT ENGINE ---
    const getContext = (pathname) => {
        if (pathname.includes('dashboard')) return 'Enterprise Dashboard';
        if (pathname.includes('inventory')) return 'Inventory Risk';
        if (pathname.includes('forecast')) return 'Demand Forecast';
        if (pathname.includes('checkout') || pathname.includes('live')) return 'Checkout Operations';
        if (pathname.includes('logistics')) return 'Logistics';
        if (pathname.includes('alerts')) return 'Operational Alerts';
        if (pathname.includes('health') || pathname.includes('model')) return 'AI Governance';
        return 'General Operations';
    };

    const currentContext = getContext(location.pathname);

    // --- KNOWLEDGE BASE (MOCK) ---
    const knowledgeBase = [
        {
            query: 'inventory',
            title: 'Inventory Management',
            content: 'Inventory management involves tracking stock levels, managing reorders, and optimizing storage to meet demand while minimizing costs. Key metrics include stockout rate, inventory turnover, and carrying costs.',
            actions: [{ label: 'View Inventory Dashboard', route: '/inventory' }]
        },
        {
            query: 'checkout',
            title: 'Checkout Operations',
            content: 'Checkout operations refer to the processes involved in customer transactions, including POS systems, payment processing, and bagging. Efficiency here is crucial for customer satisfaction and loss prevention.',
            actions: [{ label: 'View Checkout Analytics', route: '/checkout' }]
        },
        {
            query: 'forecast',
            title: 'Demand Forecasting',
            content: 'Demand forecasting uses historical data and predictive analytics to estimate future customer demand. Accurate forecasts help optimize inventory, staffing, and promotions.',
            actions: [{ label: 'Analyze Forecast Models', route: '/forecast' }]
        },
        {
            query: 'logistics',
            title: 'Logistics & Supply Chain',
            content: 'Logistics encompasses the planning, implementation, and control of the efficient, effective forward and reverse flow and storage of goods, services, and related information between the point of origin and the point of consumption.',
            actions: [{ label: 'Manage Shipments', route: '/logistics' }]
        },
        {
            query: 'alerts',
            title: 'Operational Alerts',
            content: 'Operational alerts notify staff of critical events, anomalies, or potential issues requiring immediate attention, such as system failures, security breaches, or significant deviations from performance metrics.',
            actions: [{ label: 'Review Active Alerts', route: '/alerts' }]
        },
        {
            query: 'model health',
            title: 'AI Model Health',
            content: 'AI model health refers to the performance, accuracy, and reliability of deployed artificial intelligence models. Monitoring includes data drift, model decay, and bias detection to ensure optimal operation.',
            actions: [{ label: 'Check Model Performance', route: '/model-health' }]
        },
        {
            query: 'store health',
            title: 'Store Health Overview',
            content: 'Store health provides a comprehensive view of a store\'s operational performance, including sales, inventory, staffing, and customer satisfaction metrics, to identify areas for improvement.',
            actions: [{ label: 'View Store Performance', route: '/store-health' }]
        },
        {
            query: 'supplier',
            title: 'Supplier Management',
            content: 'Supplier management involves overseeing relationships with vendors to ensure timely delivery, quality products, and competitive pricing, crucial for maintaining a healthy supply chain.',
            actions: [{ label: 'Manage Vendors', route: '/vendor' }]
        },
        {
            query: 'scenario planning',
            title: 'Scenario Planning',
            content: 'Scenario planning is a strategic planning method that businesses use to make flexible long-term plans. It involves identifying potential future scenarios and developing strategies to address each one.',
            actions: [{ label: 'Run Simulations', route: '/scenario-planning' }]
        },
        {
            query: 'dashboard',
            title: 'Enterprise Dashboard',
            content: 'The Enterprise Dashboard provides a high-level overview of key performance indicators (KPIs) across all business units, offering a centralized view of operational health and strategic progress.',
            actions: [{ label: 'Go to Dashboard', route: '/dashboard' }]
        }
    ];

    const searchKnowledgeBase = (query) => {
        const lowerQuery = query.toLowerCase();
        for (const item of knowledgeBase) {
            if (lowerQuery.includes(item.query) || item.title.toLowerCase().includes(lowerQuery)) {
                return item;
            }
        }
        return null;
    };

    // --- INTENT CLASSIFIER (MOCK + RAG) ---
    const processQuery = async (query) => {
        setIsTyping(true);
        const lowerQuery = query.toLowerCase();
        let response = { text: "I'm not sure I understand. Could you rephrase?", actions: [] };

        // Simulate API latency
        await new Promise(r => setTimeout(r, 600));

        // 1. STATUS INTENT (Specific Context High Priority)
        if ((lowerQuery.includes('status') || lowerQuery.includes('happening') || lowerQuery.includes('health')) && currentContext !== 'General Operations') {
            if (currentContext === 'Enterprise Dashboard') {
                response = {
                    text: "System is nominal. Network Health is 94/100 (+2% vs yesterday). We have 3 stores at risk and 12 imminent stockouts across the region.",
                    actions: [{ label: 'View Stores at Risk', route: '/store-health' }]
                };
            } else if (currentContext === 'Inventory Risk') {
                response = {
                    text: "Critical shortages detected in 14 SKUs, mostly in the 'Fresh' category. Major overstock identified in 8 SKUs at Store 402.",
                    actions: [{ label: 'View Shortages', route: '/inventory-risk' }]
                };
            } else if (currentContext === 'Checkout Operations') {
                response = {
                    text: "4 lanes are currently flagged for intervention. High anomaly rate detected at Store 115 due to potential missed scans.",
                    actions: [{ label: 'View Live Feed', route: '/live-checkout' }]
                };
            } else {
                // Fallback to Knowledge Base for "General" status
                const ragMatch = searchKnowledgeBase(query);
                if (ragMatch) {
                    response = {
                        text: `Based on my knowledge base: ${ragMatch.content}`,
                        actions: ragMatch.actions
                    };
                }
            }
        }
        // 2. WHY / DIAGNOSTIC INTENT (Specific Context High Priority)
        else if ((lowerQuery.includes('why') || lowerQuery.includes('reason') || lowerQuery.includes('cause')) && currentContext !== 'General Operations') {
            if (currentContext === 'Inventory Risk') {
                response = {
                    text: "The shortage in 'Avocados' is due to a 28% demand spike driven by the 'Healthy Eating' campaign, combined with a 2-day delay in the West Coast supplier delivery.",
                    actions: [{ label: 'Check Supplier', route: '/vendor' }]
                };
            } else if (currentContext === 'Checkout Operations') {
                response = {
                    text: "Anomalies at Store 115 spiked due to low vision model confidence (45%) caused by glare in the bagging area during the afternoon sun peak.",
                    actions: [{ label: 'View Model Health', route: '/model-health' }]
                };
            } else {
                const ragMatch = searchKnowledgeBase(query);
                if (ragMatch) {
                    response = {
                        text: `Here is the relevant information: ${ragMatch.content}`,
                        actions: ragMatch.actions
                    };
                }
            }
        }
        // 3. ACTION INTENT
        else if (lowerQuery.includes('do') || lowerQuery.includes('action') || lowerQuery.includes('recommend') || lowerQuery.includes('fix')) {
            if (currentContext === 'Inventory Risk') {
                response = {
                    text: "Recommended Action: Initiate an inter-store transfer from Store 105 (Overstocked) to Store 402. Estimated arrival: 4 hours.",
                    actions: [{ label: 'Create Transfer', route: '/logistics' }, { label: 'Simulate Impact', route: '/scenario-planning' }]
                };
            } else if (currentContext === 'Checkout Operations') {
                response = {
                    text: "Recommended Action: Deploy floor supervisor to Lane 4 for manual overriding and clean the camera lens at station 2.",
                    actions: [{ label: 'Alert Staff', route: '/alerts' }]
                };
            } else {
                const ragMatch = searchKnowledgeBase(query);
                if (ragMatch) {
                    response = {
                        text: `To take action on ${ragMatch.title}, you can navigate to the dedicated module.`,
                        actions: ragMatch.actions
                    };
                }
            }
        }
        // 4. GENERAL RAG SEARCH (Fallback for "What is...", "How does...", "Show me...")
        else {
            const ragMatch = searchKnowledgeBase(query);
            if (ragMatch) {
                response = {
                    text: `**${ragMatch.title}**: ${ragMatch.content}`,
                    actions: ragMatch.actions
                };
            } else {
                response = {
                    text: `I understood you are asking about "${query}" in the context of ${currentContext}. My knowledge base doesn't have specific details on that yet. Try asking about "Inventory", "Checkout", or "Forecasts".`,
                    actions: []
                };
            }
        }

        setIsTyping(false);
        return response;
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const newMessages = [...messages, { type: 'user', text: inputValue }];
        setMessages(newMessages);
        setInputValue('');

        const response = await processQuery(inputValue);
        setMessages([...newMessages, { type: 'assistant', text: response.text, actions: response.actions }]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isOpen]);

    // --- EXTERNAL TRIGGER ---
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-chatbot', handleOpen);
        return () => window.removeEventListener('open-chatbot', handleOpen);
    }, []);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* TOGGLE BUTTON */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-500 shadow-xl border-2 border-blue-400/50 flex items-center justify-center transition-all hover:scale-110"
                >
                    <Sparkles className="h-6 w-6 text-white" />
                </Button>
            )}

            {/* CHAT WINDOW */}
            {isOpen && (
                <Card className="w-[380px] h-[600px] flex flex-col bg-[#111]/95 backdrop-blur-md border border-[#333] shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
                    <CardHeader className="p-4 border-b border-[#222] bg-[#151515] flex flex-row items-center justify-between space-y-0 relative">
                        <div>
                            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-blue-500" />
                                Retail Intelligence
                            </CardTitle>
                            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
                                Context: <span className="text-blue-400 font-medium ml-1">{currentContext}</span>
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white absolute top-3 right-3" onClick={() => setIsOpen(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>

                    <ScrollArea className="flex-1 p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col mb-4 ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.type === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-sm'
                                    : 'bg-[#1a1a1a] text-gray-200 border border-[#333] rounded-tl-sm'
                                    }`}>
                                    {msg.text}
                                </div>

                                {/* ACTION BUTTONS */}
                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2 ml-1">
                                        {msg.actions.map((action, idx) => (
                                            <Button
                                                key={idx}
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs border-blue-900/50 bg-blue-900/10 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300"
                                                onClick={() => navigate(action.route)}
                                            >
                                                {action.label} <ChevronRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-start mb-4">
                                <div className="bg-[#1a1a1a] p-3 rounded-2xl rounded-tl-sm border border-[#333] flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </ScrollArea>

                    {/* QUICK PROMPTS (Contextual) */}
                    <div className="px-4 py-2 border-t border-[#222] bg-[#151515]/50 overflow-x-auto">
                        <div className="flex gap-2">
                            <Badge
                                variant="secondary"
                                className="cursor-pointer hover:bg-[#222] text-xs font-normal text-gray-400 whitespace-nowrap"
                                onClick={() => setInputValue(`What is the status of ${currentContext}?`)}
                            >
                                Status Update
                            </Badge>
                            <Badge
                                variant="secondary"
                                className="cursor-pointer hover:bg-[#222] text-xs font-normal text-gray-400 whitespace-nowrap"
                                onClick={() => setInputValue(`Why are there issues in ${currentContext}?`)}
                            >
                                Diagnostics
                            </Badge>
                            <Badge
                                variant="secondary"
                                className="cursor-pointer hover:bg-[#222] text-xs font-normal text-gray-400 whitespace-nowrap"
                                onClick={() => setInputValue(`What should I do next?`)}
                            >
                                Actions
                            </Badge>
                        </div>
                    </div>

                    <div className="p-3 bg-[#111] border-t border-[#222]">
                        <div className="relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={`Ask about ${currentContext}...`}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-full py-2.5 px-4 pr-10 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                            />
                            <Button
                                size="icon"
                                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white"
                                onClick={handleSend}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Chatbot;
