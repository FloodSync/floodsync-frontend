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

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [township, setTownship] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();

  const cities = [
    { key: "1", value: "Yangon" },
    { key: "2", value: "Mandalay" },
    { key: "3", value: "Naypyidaw" },
    { key: "4", value: "Bago" },
    { key: "5", value: "Taunggyi" },
  ];

  const townships = [
    { key: "1", value: "Lanmadaw", cityId: "1" },
    { key: "2", value: "Hlaing", cityId: "1" },
    { key: "3", value: "Kamayut", cityId: "1" },
    { key: "4", value: "Mayangone", cityId: "1" },
    { key: "5", value: "Sanchaung", cityId: "1" },
    { key: "6", value: "Chanmyathazi", cityId: "2" },
    { key: "7", value: "Maharaing", cityId: "2" },
    { key: "8", value: "Chanayethazan", cityId: "2" },
    { key: "9", value: "Pyigyidagun", cityId: "2" },
    { key: "10", value: "Amarapura", cityId: "2" },
    { key: "11", value: "Zabuthiri", cityId: "3" },
    { key: "12", value: "Pobbathiri", cityId: "3" },
    { key: "13", value: "Dekkhinathiri", cityId: "3" },
    { key: "14", value: "Ottarathiri", cityId: "3" },
  ];

  const handleLoginPress = useCallback(() => {
    console.log("Login pressed");
    router.push("/(auth)/login");
  }, []);

  // Filter townships based on selected city
  const filteredTownships = city
    ? townships.filter((township) => township.cityId === city)
    : townships;

  const getCityName = (cityKey: string) => {
    return cities.find((c) => c.key === cityKey)?.value || "";
  };

  const getTownshipName = (townshipKey: string) => {
    return townships.find((t) => t.key === townshipKey)?.value || "";
  };

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
            data={cities}
            placeholder="Select City"
            boxStyles={{ backgroundColor: "white", borderRadius: 12 }}
          />
        </Box>

        <Box className="mb-6">
          <Text className="text-gray-700 mb-1">Township</Text>
          <SelectList
            setSelected={setTownship}
            data={filteredTownships} // Use filtered townships
            placeholder="Select Township"
            boxStyles={{ backgroundColor: "white", borderRadius: 12 }}
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
