import React, { useState, useRef } from "react";
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  StatusBar
} from "react-native";

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
    <View style={{ 
      marginVertical: 4, 
      marginHorizontal: 16,
      alignItems: item.sender === "user" ? "flex-end" : "flex-start" 
    }}>
      <View 
        style={{
          backgroundColor: item.sender === "user" ? "#3b82f6" : "#ffffff",
          borderWidth: 1,
          borderColor: item.sender === "user" ? "#3b82f6" : "#e5e7eb",
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 12,
          maxWidth: "85%",
          borderBottomRightRadius: item.sender === "user" ? 4 : 20,
          borderBottomLeftRadius: item.sender === "user" ? 20 : 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Text style={{
          color: item.sender === "user" ? "#ffffff" : "#1f2937",
          fontSize: 16,
          lineHeight: 22,
        }}>
          {item.text}
        </Text>
      </View>
      <Text style={{
        fontSize: 12,
        marginTop: 4,
        color: item.sender === "user" ? "#3b82f6" : "#6b7280",
      }}>
        {item.sender === "user" ? "You" : "Flood Assistant"}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header */}
      {/* <View style={{
        backgroundColor: "#ffffff",
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827" }}>
              Flood Safety
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 16, marginTop: 2 }}>
              AI Assistant
            </Text>
          </View>
        </View>
      </View> */}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Suggested Questions */}
        <View style={{
          backgroundColor: "#ffffff",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6",
        }}>
          <Text style={{ color: "#4b5563", fontSize: 14, fontWeight: "500", marginBottom: 8 }}>
            Quick Questions
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {suggestedQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleQuickQuestion(question)}
                style={{
                  backgroundColor: "#dbeafe",
                  borderWidth: 1,
                  borderColor: "#93c5fd",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 12,
                }}
              >
                <Text style={{ color: "#1e40af", fontSize: 14, fontWeight: "600", textAlign: "center" }}>
                  {question}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chat Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          inverted
          style={{ flex: 1 }}
        />

        {/* Input Area */}
        <View style={{
          backgroundColor: "#ffffff",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
        }}>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
            <View style={{
              flex: 1,
              backgroundColor: "#f3f4f6",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: "#d1d5db",
            }}>
              <TextInput
                style={{ 
                  color: "#111827", 
                  fontSize: 16, 
                  maxHeight: 80,
                }}
                placeholder="Type your message..."
                placeholderTextColor="#9ca3af"
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
                textAlignVertical="center"
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: input.trim() ? "#3b82f6" : "#9ca3af",
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2,
              }}
              onPress={handleSend}
              disabled={!input.trim()}
            >
              <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 18 }}>
                ↑
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Character count */}
          {input.length > 0 && (
            <Text style={{ color: "#9ca3af", fontSize: 12, textAlign: "right", marginTop: 8 }}>
              {input.length}/500
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Emergency Button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 100,
          right: 24,
          backgroundColor: "#dc2626",
          width: 64,
          height: 64,
          borderRadius: 32,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => handleQuickQuestion("EMERGENCY: Need immediate help!")}
      >
        <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 12, textAlign: "center" }}>
          SOS
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Guide;