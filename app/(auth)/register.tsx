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
import { SelectList } from "react-native-dropdown-select-list";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRegister } from "@/hooks/use-auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { myanmarCities, myanmarTownships } from "@/lib/data/myanmar-locations";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [township, setTownship] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();

  const handleLoginPress = useCallback(() => {
    console.log("Login pressed");
    router.push("/(auth)/login");
  }, []);

  // Filter townships based on selected city
  const filteredTownships = city
    ? myanmarTownships.filter((t) => t.cityId === city)
    : [];

  const getCityName = (cityKey: string) => {
    return myanmarCities.find((c) => c.key === cityKey)?.value || "";
  };

  const getTownshipName = (townshipKey: string) => {
    return myanmarTownships.find((t) => t.key === townshipKey)?.value || "";
  };

  // Reset township when city changes
  React.useEffect(() => {
    if (city) {
      setTownship("");
    }
  }, [city]);

  const handleRegister = () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !phone.trim() ||
      !city ||
      !township
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const cityName = getCityName(city);
    const townshipName = getTownshipName(township);

    console.log("data", {
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      city: cityName,
      township: townshipName,
    });

    registerMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      city: cityName,
      township: townshipName,
    });
  };

  React.useEffect(() => {
    if (registerMutation.isError) {
      Alert.alert(
        "Registration Failed",
        registerMutation.error?.message || "Failed to register"
      );
    }
  }, [registerMutation.isError, registerMutation.error]);

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Heading className="text-blue-700 text-3xl font-bold mb-5 text-center">
          Register
        </Heading>

        <Box className="mb-4">
          <Text className="text-gray-700 mb-1">Full Name</Text>
          <TextInput
            className="bg-white p-3 rounded-2xl border border-gray-300"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />
        </Box>

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

        <Box className="mb-4 relative">
          <Text className="text-gray-700 mb-1">Password</Text>
          <TextInput
            className="bg-white p-3 rounded-2xl border border-gray-300"
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

        <Box className="mb-4">
          <Text className="text-gray-700 mb-1">Phone Number</Text>
          <TextInput
            className="bg-white p-3 rounded-2xl border border-gray-300"
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </Box>

        <Box className="mb-4">
          <Text className="text-gray-700 mb-1">City</Text>
          <SelectList
            setSelected={setCity}
            data={myanmarCities}
            placeholder="Search or select city..."
            searchPlaceholder="Search city..."
            boxStyles={{ backgroundColor: "white", borderRadius: 12 }}
            inputStyles={{ color: "#000" }}
            dropdownTextStyles={{ color: "#000" }}
          />
        </Box>

        <Box className="mb-6">
          <Text className="text-gray-700 mb-1">Township</Text>
          <SelectList
            setSelected={setTownship}
            data={filteredTownships}
            placeholder={
              city
                ? "Search or select township..."
                : "Please select a city first"
            }
            searchPlaceholder="Search township..."
            boxStyles={{
              backgroundColor: city ? "white" : "#f3f4f6",
              borderRadius: 12,
              opacity: city ? 1 : 0.6,
            }}
            inputStyles={{ color: "#000" }}
            dropdownTextStyles={{ color: "#000" }}
          />
        </Box>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={registerMutation.isPending}
          className="bg-blue-600 p-4 rounded-2xl"
          style={{ opacity: registerMutation.isPending ? 0.6 : 1 }}
        >
          {registerMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">
              Register
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-gray-600 text-center mt-4">
          Already have an account?{" "}
          <Pressable onPress={handleLoginPress}>
            <Text className="text-blue-600 font-semibold">Login</Text>
          </Pressable>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Register;
