import React, { useState, useRef } from "react";
import { 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView
} from "react-native";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
};

const Guide = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Flood Safety Assistant. I can help you with emergency procedures, safety tips, and personalized guidance.",
      sender: "ai",
    },
    {
      id: "2", 
      text: "Tell me about your situation or ask any flood-related questions for personalized assistance.",
      sender: "ai",
    }
  ]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const suggestedQuestions = [
    "What to do during flooding?",
    "Emergency kit checklist", 
    "Evacuation procedures",
    "Flood safety tips",
    "Report emergency"
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages(prev => [userMessage, ...prev]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      setMessages(prev => [aiResponse, ...prev]);
    }, 1000);
  };

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    
    if (input.includes("during") || input.includes("what to do")) {
      return {
        id: (Date.now() + 1).toString(),
        text: "🚨 During a Flood:\n\n• Move to higher ground immediately\n• Avoid walking/driving through flood waters\n• Evacuate if instructed\n• Stay away from electrical equipment\n• Listen to emergency alerts",
        sender: "ai",
      };
    }

    if (input.includes("kit") || input.includes("prepare") || input.includes("emergency kit")) {
      return {
        id: (Date.now() + 1).toString(),
        text: "🛡️ Emergency Kit Essentials:\n\n• Water (1 gal/person/day)\n• Non-perishable food\n• First aid kit\n• Flashlight + batteries\n• Important documents\n• Medications",
        sender: "ai",
      };
    }

    if (input.includes("evacuate") || input.includes("evacuation")) {
      return {
        id: (Date.now() + 1).toString(),
        text: "📍 Evacuation Guidance:\n\n• Follow official orders immediately\n• Take emergency kit\n• Use designated routes\n• Avoid flooded roads\n• Inform family of location",
        sender: "ai",
      };
    }

    if (input.includes("emergency") || input.includes("help") || input.includes("sos")) {
      return {
        id: (Date.now() + 1).toString(),
        text: "🚨 EMERGENCY PROTOCOL:\n\n1. Call emergency services: 911\n2. Move to highest safe location\n3. Avoid flood waters\n4. Stay on upper floors\n5. Wait for rescue\n\nShare your location if possible.",
        sender: "ai",
      };
    }

    return {
      id: (Date.now() + 1).toString(),
      text: "I understand your concern about flood safety. Could you share more details about your situation? This helps me provide the most relevant guidance.",
      sender: "ai",
    };
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <Box className={`my-1 mx-4 ${item.sender === "user" ? "items-end" : "items-start"}`}>
      <Box 
        className={`rounded-2xl px-4 py-3 max-w-[85%] ${
          item.sender === "user" 
            ? "bg-blue-500 rounded-br-sm" 
            : "bg-white border border-gray-200 rounded-bl-sm"
        } shadow-sm`}
      >
        <Text className={`text-base leading-6 ${
          item.sender === "user" ? "text-white" : "text-gray-800"
        }`}>
          {item.text}
        </Text>
      </Box>
      <Text className={`text-xs mt-1 ${
        item.sender === "user" ? "text-blue-600" : "text-gray-500"
      }`}>
        {item.sender === "user" ? "You" : "Flood Assistant"}
      </Text>
    </Box>
  );

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header */}
      <Box className="bg-white px-6 py-4 border-b border-gray-200 shadow-sm">
        <Box className="flex-row items-center justify-between">
          <Box>
            <Heading className="text-2xl font-bold text-gray-900">Flood Safety</Heading>
            <Text className="text-gray-600 text-base mt-1">AI Assistant</Text>
          </Box>
        </Box>
      </Box>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Suggested Questions */}
        <Box className="bg-white px-4 py-3 border-b border-gray-100">
          <Text className="text-gray-600 text-sm font-medium mb-2">Quick Questions</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            <Box className="flex-row space-x-3">
              {suggestedQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleQuickQuestion(question)}
                  className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 active:bg-blue-100"
                >
                  <Text className="text-blue-700 text-sm font-semibold text-center">
                    {question}
                  </Text>
                </TouchableOpacity>
              ))}
            </Box>
          </ScrollView>
        </Box>

        {/* Chat Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          inverted
          className="flex-1"
        />

        {/* Input Area */}
        <Box className="bg-white px-4 py-3 border-t border-gray-200">
          <Box className="flex-row items-end space-x-3">
            <Box className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 border border-gray-300">
              <TextInput
                className="text-gray-900 text-base max-h-20"
                placeholder="Type your message..."
                placeholderTextColor="#9ca3af"
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
                textAlignVertical="center"
              />
            </Box>
            <TouchableOpacity
              className={`w-12 h-12 rounded-full items-center justify-center shadow-sm ${
                input.trim() ? "bg-blue-500 active:bg-blue-600" : "bg-gray-400"
              }`}
              onPress={handleSend}
              disabled={!input.trim()}
            >
              <Text className="text-white font-bold text-lg">↑</Text>
            </TouchableOpacity>
          </Box>
          
          {/* Character count */}
          {input.length > 0 && (
            <Text className="text-gray-400 text-xs text-right mt-2">
              {input.length}/500
            </Text>
          )}
        </Box>
      </KeyboardAvoidingView>

      {/* Emergency Button */}
      <TouchableOpacity
        className="absolute bottom-24 right-6 bg-red-500 w-16 h-16 rounded-full items-center justify-center shadow-xl active:bg-red-600"
        onPress={() => handleQuickQuestion("EMERGENCY: Need immediate help!")}
      >
        <Text className="text-white font-bold text-center text-xs">SOS</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Guide;