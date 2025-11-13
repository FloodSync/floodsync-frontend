import React, { useState, useCallback } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
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
  const [currentStep, setCurrentStep] = useState(1); // 1: Name/Email, 2: Password/Phone, 3: City/Township
  
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

  const nextStep = () => {
    if (currentStep === 1 && name.trim() && email.trim()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && password.trim() && phone.trim()) {
      setCurrentStep(3);
    } else {
      Alert.alert("Error", "Please fill in all fields before continuing");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step 1: Name and Email
  const renderStep1 = () => (
    <>
      <Box className="mb-4">
        <Text className="text-gray-700 mb-1">Full Name</Text>
        <TextInput
          className="bg-white p-3 rounded-2xl border border-gray-300"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />
      </Box>

      <Box className="mb-6">
        <Text className="text-gray-700 mb-1">Email</Text>
        <TextInput
          className="bg-white p-3 rounded-2xl border border-gray-300"
          placeholder="Enter your email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </Box>
    </>
  );

  // Step 2: Password and Phone
  const renderStep2 = () => (
    <>
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

      <Box className="mb-6">
        <Text className="text-gray-700 mb-1">Phone Number</Text>
        <TextInput
          className="bg-white p-3 rounded-2xl border border-gray-300"
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </Box>
    </>
  );

  // Step 3: City and Township
  const renderStep3 = () => (
    <>
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
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView 
        contentContainerStyle={{ 
          padding: 20, 
          flexGrow: 1,
          justifyContent: 'center' // This centers the content vertically
        }}
      >
        {/* App Logo */}
        <Box className="items-center mb-8">
          <Image 
            source={require('@/assets/images/logo.png')} 
            className="w-[150px] h-[150px] mb-4"
            resizeMode="contain"
          />
        </Box>

        {/* Progress Indicator */}
        <Box className="flex-row justify-center mb-6">
          {[1, 2, 3].map((step) => (
            <Box key={step} className="flex-row items-center">
              <Box
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  currentStep >= step ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    currentStep >= step ? "text-white" : "text-gray-600"
                  }`}
                >
                  {step}
                </Text>
              </Box>
              {step < 3 && (
                <Box
                  className={`w-8 h-1 mx-1 ${
                    currentStep > step ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              )}
            </Box>
          ))}
        </Box>

        <Heading className="text-blue-700 text-3xl font-bold text-center">
          {currentStep === 1 && "Personal Information"}
          {currentStep === 2 && "Account Security"}
          {currentStep === 3 && "Location Details"}
        </Heading>

        {/* Current Step Content - Wrapped in a centered container */}
        <Box className="flex-1 justify-center">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </Box>

        {/* Navigation Buttons */}
        <Box className="mt-8">
          {currentStep === 3 ? (
            // Final Step - Register Button
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
                  Complete Registration
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            // Next Step Button
            <TouchableOpacity
              onPress={nextStep}
              className="bg-blue-600 p-4 rounded-2xl"
            >
              <Text className="text-white text-center font-semibold text-lg">
                Continue
              </Text>
            </TouchableOpacity>
          )}

          {/* Back Button */}
          {currentStep > 1 && (
            <TouchableOpacity
              onPress={prevStep}
              className="bg-gray-300 p-4 rounded-2xl mt-3"
            >
              <Text className="text-gray-800 text-center font-semibold text-lg">
                Back
              </Text>
            </TouchableOpacity>
          )}

          {/* Login Link - Only show on first step */}
          {currentStep === 1 && (
            <Text className="text-gray-600 text-center mt-4">
              Don't have an account?{" "}
              <Text className="text-blue-600 font-semibold" onPress={handleLoginPress}>
                Login
              </Text>
            </Text>
          )}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Register;