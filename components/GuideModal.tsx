import React, { useState, useRef, useEffect } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { aiChatApi } from "@/lib/api/ai-chat";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  type?: "text" | "image" | "imageWithText";
  imageUrl?: string;
};

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = "ddvflihpy";
const CLOUDINARY_UPLOAD_PRESET = "floodsync";

interface GuideModalProps {
  onClose: () => void;
}

// Animated typing indicator component (like ChatGPT)
const TypingIndicator = () => {
  const [dot1] = useState(new Animated.Value(0.3));
  const [dot2] = useState(new Animated.Value(0.3));
  const [dot3] = useState(new Animated.Value(0.3));

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = [
      animateDot(dot1, 0),
      animateDot(dot2, 200),
      animateDot(dot3, 400),
    ];

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Animated.View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#6b7280",
          opacity: dot1,
        }}
      />
      <Animated.View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#6b7280",
          opacity: dot2,
        }}
      />
      <Animated.View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#6b7280",
          opacity: dot3,
        }}
      />
    </View>
  );
};

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    source: "camera" | "gallery";
    uploadedUrl?: string;
  } | null>(null);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const suggestedQuestions = [
    "What to do during flooding?",
    "Emergency kit checklist",
    "Evacuation procedures",
    "Flood safety tips",
    "Report emergency",
    "How to prepare for floods?",
    "First aid for flood injuries",
    "Post-flood cleanup guide",
  ];

  // Cloudinary upload function
  const uploadToCloudinary = async (
    uri: string,
    source: "camera" | "gallery"
  ) => {
    setUploading(true);

    try {
      console.log("Starting Cloudinary upload...");

      const formData = new FormData();

      formData.append("file", {
        uri: uri,
        type: "image/jpeg",
        name: `flood-${source}-${Date.now()}.jpg`,
      } as any);

      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);
      formData.append("folder", "flood-assistant");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudinary upload error:", errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("Cloudinary upload successful:", result);

      if (result.secure_url) {
        const uploadedUrl = result.secure_url;
        console.log("Cloudinary URL:", uploadedUrl);
        return uploadedUrl;
      }

      throw new Error("No URL found in Cloudinary response");
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      Alert.alert("Upload Failed", "Please try again.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleImageSelection(result.assets[0].uri, "gallery");
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera permissions to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleImageSelection(result.assets[0].uri, "camera");
    }
  };

  // Handle image selection (upload but don't send immediately)
  const handleImageSelection = async (
    imageUri: string,
    source: "camera" | "gallery"
  ) => {
    setUploading(true);

    try {
      console.log("Uploading image to Cloudinary...");

      const uploadedUrl = await uploadToCloudinary(imageUri, source);

      if (uploadedUrl) {
        setSelectedImage({
          uri: imageUri,
          source: source,
          uploadedUrl: uploadedUrl,
        });

        console.log("Image uploaded and ready to send with message");
      } else {
        Alert.alert(
          "Upload Failed",
          "Could not upload image. Please try again."
        );
      }
    } catch (error) {
      console.error("Image selection error:", error);
      Alert.alert("Error", "Failed to process image.");
    } finally {
      setUploading(false);
    }
  };

  // Handle sending message (text only or text + image)
  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userInput = input.trim();
    const imageUrl = selectedImage?.uploadedUrl;

    let userMessage: Message;

    if (selectedImage && userInput) {
      userMessage = {
        id: Date.now().toString(),
        text: userInput,
        sender: "user",
        type: "imageWithText",
        imageUrl: imageUrl,
      };
    } else if (selectedImage) {
      userMessage = {
        id: Date.now().toString(),
        text: `${selectedImage.source === "camera" ? "Photo" : "Image"}`,
        sender: "user",
        type: "image",
        imageUrl: imageUrl,
      };
    } else {
      userMessage = {
        id: Date.now().toString(),
        text: userInput,
        sender: "user",
        type: "text",
      };
    }

    setMessages((prev) => [userMessage, ...prev]);
    setInput("");
    setSelectedImage(null);
    setShowQuickQuestions(false);
    setLoading(true);

    // Add loading message with typing indicator
    const loadingMessageId = (Date.now() + 1).toString();
    const loadingMessage: Message = {
      id: loadingMessageId,
      text: "", // Empty text for typing indicator
      sender: "ai",
      type: "text",
    };
    setMessages((prev) => [loadingMessage, ...prev]);

    try {
      let aiResponseText: string;

      // Call appropriate API endpoint
      if (imageUrl) {
        // Image with optional text
        const response = await aiChatApi.sendImageMessage(
          userInput || "What do you see in this image?",
          imageUrl
        );
        aiResponseText = response.response;
      } else {
        // Text only
        const response = await aiChatApi.sendTextMessage(userInput);
        aiResponseText = response.response;
      }

      // Stream the response character by character (simulated)
      await streamTextResponse(loadingMessageId, aiResponseText);
    } catch (error: any) {
      console.error("Error getting AI response:", error);

      // Replace loading message with error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                id: loadingMessageId,
                text: "Sorry, I'm having trouble connecting. Please try again.",
                sender: "ai",
                type: "text",
              }
            : msg
        )
      );

      Alert.alert(
        "Connection Error",
        "Unable to reach AI assistant. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setShowQuickQuestions(false);
    setTimeout(() => handleSend(), 100);
  };

  // Cancel image selection
  const cancelImageSelection = () => {
    setSelectedImage(null);
    setInput("");
  };

  // Stream text response word by word (simulated ChatGPT effect)
  const streamTextResponse = async (messageId: string, fullText: string) => {
    // Split by words but keep punctuation attached
    const words = fullText.match(/\S+\s*/g) || [fullText];
    let currentText = "";

    // Stream word by word for smooth ChatGPT-like effect
    for (let i = 0; i < words.length; i++) {
      currentText += words[i];

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                text: currentText,
              }
            : msg
        )
      );

      // Auto-scroll to show new text as it streams
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 0);

      // Variable delay: faster for short words, slower for longer words
      // Makes it feel natural like ChatGPT
      const wordLength = words[i].trim().length;
      const delay = Math.min(20 + wordLength * 3, 80);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={{
        marginVertical: 8,
        marginHorizontal: 16,
        alignItems: item.sender === "user" ? "flex-end" : "flex-start",
      }}
    >
      {item.type === "image" || item.type === "imageWithText" ? (
        <View
          style={{
            maxWidth: "85%",
            alignItems: item.sender === "user" ? "flex-end" : "flex-start",
          }}
        >
          <View
            style={{
              borderRadius: 16,
              overflow: "hidden",
              maxWidth: "100%",
              backgroundColor: item.sender === "user" ? "#3b82f6" : "white",
              borderWidth: item.sender === "user" ? 0 : 1,
              borderColor: item.sender === "user" ? "transparent" : "#e5e7eb",
              borderBottomRightRadius: item.sender === "user" ? 4 : 16,
              borderBottomLeftRadius: item.sender === "user" ? 16 : 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={{
                width: 200,
                height: 200,
              }}
              resizeMode="cover"
            />
            {item.text &&
              item.text !== `${item.sender === "user" ? "Photo" : "Image"}` && (
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor:
                      item.sender === "user" ? "#3b82f6" : "transparent",
                    borderTopWidth: item.sender === "user" ? 0 : 1,
                    borderTopColor: "#e5e7eb",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: item.sender === "user" ? "white" : "#6b7280",
                      textAlign: "left",
                    }}
                  >
                    {item.text}
                  </Text>
                </View>
              )}
          </View>
        </View>
      ) : (
        <View
          style={{
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
            maxWidth: "85%",
            minWidth: 120,
            backgroundColor: item.sender === "user" ? "#3b82f6" : "white",
            borderWidth: item.sender === "user" ? 0 : 1,
            borderColor: item.sender === "user" ? "transparent" : "#e5e7eb",
            borderBottomRightRadius: item.sender === "user" ? 4 : 16,
            borderBottomLeftRadius: item.sender === "user" ? 16 : 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          {item.sender === "ai" && item.text === "" ? (
            // Typing indicator in bubble (animated dots)
            <TypingIndicator />
          ) : (
            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                color: item.sender === "user" ? "white" : "#1f2937",
              }}
            >
              {item.text}
            </Text>
          )}
        </View>
      )}
      <Text
        style={{
          fontSize: 12,
          marginTop: 4,
          color: item.sender === "user" ? "#2563eb" : "#6b7280",
        }}
      >
        {item.sender === "user" ? "You" : "Flood Assistant"}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f9ff" }}>
      {/* Modal Header */}
      <View
        style={{
          backgroundColor: "white",
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#111827" }}
            >
              Flood Safety
            </Text>
            <Text style={{ fontSize: 14, color: "#6b7280" }}>AI Assistant</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          inverted
          style={{ flex: 1 }}
        />

        {/* Quick Questions - Bottom Layout */}
        {showQuickQuestions && messages.length === 0 && (
          <View
            style={{
              backgroundColor: "white",
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: "#e5e7eb",
              borderBottomWidth: 1,
              borderBottomColor: "#e5e7eb",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons name="flash" size={18} color="#4b5563" />
              <Text
                style={{
                  color: "#4b5563",
                  fontSize: 16,
                  fontWeight: "600",
                  marginLeft: 8,
                }}
              >
                Quick Questions
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            >
              <View style={{ flexDirection: "row", gap: 12 }}>
                {suggestedQuestions.map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleQuickQuestion(question)}
                    style={{
                      backgroundColor: "#dbeafe",
                      borderWidth: 1,
                      borderColor: "#bfdbfe",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={16}
                      color="#1e40af"
                    />
                    <Text
                      style={{
                        color: "#1e40af",
                        fontSize: 14,
                        fontWeight: "500",
                        marginLeft: 8,
                      }}
                    >
                      {question}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Input Area */}
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
          }}
        >
          {/* Image Preview */}
          {selectedImage && (
            <View
              style={{
                marginBottom: 12,
                backgroundColor: "#dbeafe",
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: "#bfdbfe",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="checkmark-circle" size={18} color="#1e40af" />
                  <Text
                    style={{
                      color: "#1e40af",
                      fontWeight: "600",
                      marginLeft: 8,
                    }}
                  >
                    Image Ready to Send
                  </Text>
                </View>
                <TouchableOpacity onPress={cancelImageSelection}>
                  <Ionicons name="close-circle" size={20} color="#dc2626" />
                </TouchableOpacity>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={{ width: 64, height: 64, borderRadius: 8 }}
                  resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#1e40af",
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    {selectedImage.source === "camera"
                      ? "Photo captured"
                      : "Image selected"}
                  </Text>
                  <Text style={{ color: "#3b82f6", fontSize: 12 }}>
                    Add your message below
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Camera & Gallery Buttons */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              gap: 16,
              marginBottom: 12,
            }}
          >
            <TouchableOpacity
              onPress={takePhoto}
              disabled={uploading}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "black",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 9999,
                opacity: uploading ? 0.5 : 1,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Ionicons name="camera" size={18} color="white" />
              <Text
                style={{ color: "white", fontWeight: "600", marginLeft: 8 }}
              >
                {uploading ? "Uploading..." : "Camera"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImage}
              disabled={uploading}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "black",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 9999,
                opacity: uploading ? 0.5 : 1,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Ionicons name="images" size={18} color="white" />
              <Text
                style={{ color: "white", fontWeight: "600", marginLeft: 8 }}
              >
                {uploading ? "Uploading..." : "Image upload"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Text Input */}
          <View
            style={{ flexDirection: "row", alignItems: "flex-end", gap: 12 }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "#f3f4f6",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: "#d1d5db",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <TextInput
                style={{ color: "#111827", fontSize: 16, maxHeight: 80 }}
                placeholder={
                  selectedImage
                    ? "Add a message to send with image..."
                    : "Type your message or ask a question..."
                }
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
                width: 48,
                height: 48,
                borderRadius: 9999,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
                backgroundColor:
                  (input.trim() || selectedImage) && !uploading && !loading
                    ? "#3b82f6"
                    : "#9ca3af",
              }}
              onPress={handleSend}
              disabled={
                (!input.trim() && !selectedImage) || uploading || loading
              }
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {/* Character Count */}
          {input.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                {input.length}/500 characters
              </Text>
              {selectedImage && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="image" size={12} color="#4b5563" />
                  <Text
                    style={{ color: "#9ca3af", fontSize: 12, marginLeft: 4 }}
                  >
                    Image attached
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
