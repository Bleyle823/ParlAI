"use client";

import { useState } from "react";
import { useCompletion } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, TrendingUp, Wallet, Activity } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Polymarket trading agent. I can help you analyze markets, place bets, check your positions, and more. What would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const { complete, isLoading } = useCompletion({
    api: "/api/chat",
    onFinish: (prompt, completion) => {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: completion,
          timestamp: new Date(),
        },
      ]);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    const apiMessages = [...messages, userMessage].map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    await complete("", {
      body: { messages: apiMessages },
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 h-screen flex flex-col max-w-4xl">
        {/* Header */}
        <Card className="mb-4 bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              Polymarket Trading Agent
              <Badge variant="secondary" className="ml-auto">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className="flex gap-3">
                    <div className={`p-2 rounded-full ${
                      message.role === "user" 
                        ? "bg-blue-100 dark:bg-blue-900" 
                        : "bg-slate-100 dark:bg-slate-700"
                    }`}>
                      {message.role === "user" ? (
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Bot className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {message.role === "user" ? "You" : "Agent"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800"
                          : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-700">
                      <Bot className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Agent</span>
                        <span className="text-xs text-slate-500">typing...</span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <Separator />
            
            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about markets, place bets, check positions..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Connected to Polygon network • Polymarket API enabled
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Status Bar */}
        <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </div>
            <div className="flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              <span>Wallet Active</span>
            </div>
          </div>
          <div>
            Powered by GPT-4o-mini + GOAT SDK
          </div>
        </div>
      </div>
    </div>
  );
}
