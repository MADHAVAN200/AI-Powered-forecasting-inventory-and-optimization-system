"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User, Lightbulb } from "lucide-react";
export function ChatBot({ onClose }) {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: "bot",
            content: "Hi! I'm your OptiFresh assistant. I can help explain freshness scores, recommend actions, and answer questions about your inventory. What would you like to know?",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const quickQuestions = [
        "What does a freshness score of 72% mean?",
        "Should I transfer or flash sale this item?",
        "How is the freshness score calculated?",
        "What are the blockchain verification steps?",
    ];
    const handleSendMessage = () => {
        if (!inputValue.trim())
            return;
        const userMessage = {
            id: messages.length + 1,
            type: "user",
            content: inputValue,
            timestamp: new Date(),
        };
        // Simulate bot response
        const botResponse = {
            id: messages.length + 2,
            type: "bot",
            content: getBotResponse(inputValue),
            timestamp: new Date(),
        };
        setMessages([...messages, userMessage, botResponse]);
        setInputValue("");
    };
    const getBotResponse = (question) => {
        const lowerQuestion = question.toLowerCase();
        if (lowerQuestion.includes("freshness score")) {
            return "Freshness scores are calculated using IoT sensors, time since harvest, temperature history, and visual inspection data. A score of 72% means the product is still good but should be prioritized for sale or transfer within 24-48 hours.";
        }
        if (lowerQuestion.includes("transfer") || lowerQuestion.includes("flash sale")) {
            return "For items with 60-80% freshness, I recommend transfer to high-demand stores first. Flash sales work best for 40-60% freshness items. Below 40%, consider clearance pricing or donation programs.";
        }
        if (lowerQuestion.includes("blockchain")) {
            return "Our blockchain system tracks: 1) Harvest verification, 2) Transport conditions, 3) Quality inspections, 4) Store receipt, and 5) Freshness updates. Each step is cryptographically verified for transparency.";
        }
        return "I can help with freshness analysis, action recommendations, inventory optimization, and blockchain verification questions. Could you be more specific about what you'd like to know?";
    };
    const handleQuickQuestion = (question) => {
        setInputValue(question);
    };
    return (<Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bot className="w-5 h-5 mr-2 text-blue-600"/>
            OptiFresh Assistant
          </DialogTitle>
          <DialogDescription>Get help with freshness scores and inventory decisions</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {messages.map((message) => (<div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <Card className={`max-w-[80%] ${message.type === "user" ? "bg-blue-500 text-white" : "bg-gray-50"}`}>
                <CardContent className="p-3">
                  <div className="flex items-start space-x-2">
                    {message.type === "bot" ? (<Bot className="w-4 h-4 mt-0.5 text-blue-600"/>) : (<User className="w-4 h-4 mt-0.5"/>)}
                    <p className="text-sm">{message.content}</p>
                  </div>
                </CardContent>
              </Card>
            </div>))}
        </div>

        {messages.length === 1 && (<div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Lightbulb className="w-4 h-4 mr-1"/>
              Quick questions:
            </div>
            {quickQuestions.map((question, index) => (<Button key={index} variant="outline" size="sm" className="w-full text-left justify-start text-xs h-auto py-2 px-3 bg-transparent" onClick={() => handleQuickQuestion(question)}>
                {question}
              </Button>))}
          </div>)}

        <div className="flex space-x-2 pt-4 border-t">
          <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Ask about freshness, actions, or blockchain..." onKeyPress={(e) => e.key === "Enter" && handleSendMessage()} className="flex-1"/>
          <Button onClick={handleSendMessage} size="sm">
            <Send className="w-4 h-4"/>
          </Button>
        </div>
      </DialogContent>
    </Dialog>);
}
