import React, { useState, useCallback } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLogin } from "@/hooks/use-auth";
import { SafeAreaView } from "react-native-safe-area-context";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    loginMutation.mutate({ email: email.trim(), password });
  };

  const handleRegisterPress = useCallback(() => {
    router.push("/(auth)/register");
  }, []);

  React.useEffect(() => {
    if (loginMutation.isError) {
      Alert.alert(
        "Login Failed",
        loginMutation.error?.message || "Invalid credentials"
      );
    }
  }, [loginMutation.isError, loginMutation.error]);

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Heading className="text-blue-700 text-3xl font-bold mb-5 text-center">
          Login
        </Heading>

        <Box className="mb-4">
          <Text className="text-gray-700 mb-1">Email</Text>
          <TextInput
            className="bg-white p-3 rounded-2xl border border-gray-300"
            placeholder="Enter your email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </Box>

        {/* Password with eye toggle */}
        <Box className="mb-6 relative">
          <Text className="text-gray-700 mb-1">Password</Text>
          <TextInput
            className="bg-white p-3 rounded-2xl border border-gray-300 pr-12"
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-9"
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="gray"
            />
          </Pressable>
        </Box>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loginMutation.isPending}
          className="bg-blue-600 p-4 rounded-2xl"
          style={{ opacity: loginMutation.isPending ? 0.6 : 1 }}
        >
          {loginMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">
              Login
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-gray-600 text-center mt-4">
          Don’t have an account?{" "}
          <Pressable onPress={handleRegisterPress}>
            <Text className="text-blue-600 font-semibold">Register</Text>
          </Pressable>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;
