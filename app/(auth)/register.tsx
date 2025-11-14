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

const validateName = (name: string) => {
  if (!name.trim()) return "Name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  if (!/^[a-zA-Z\s]+$/.test(name.trim()))
    return "Name can only contain letters and spaces";
  return null;
};

const validateEmail = (email: string) => {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim()))
    return "Please enter a valid email address";
  return null;
};

const validatePassword = (password: string) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password))
    return "Password must contain both uppercase and lowercase letters";
  if (!/(?=.*\d)/.test(password))
    return "Password must contain at least one number";
  return null;
};

const validatePhone = (phone: string) => {
  if (!phone.trim()) return "Phone number is required";
  const phoneRegex = /^[0-9+\-\s()]{10,}$/;
  if (!phoneRegex.test(phone.trim()))
    return "Please enter a valid phone number";
  if (phone.replace(/\D/g, "").length < 10)
    return "Phone number must be at least 10 digits";
  return null;
};

const validateCity = (city: string) => {
  if (!city) return "City selection is required";
  return null;
};

const validateTownship = (township: string, city: string) => {
  if (!township) return "Township selection is required";
  if (city && !township) return "Please select a township for the chosen city";
  return null;
};

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [township, setTownship] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Name/Email, 2: Password/Phone, 3: City/Township
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    township: "",
  });

  // Add validation function for each step
  const validateStep = (step: number) => {
    const errors = {
      name: "",
      email: "",
      password: "",
      phone: "",
      city: "",
      township: "",
    };

    let isValid = true;

    if (step === 1) {
      const nameError = validateName(name);
      const emailError = validateEmail(email);

      if (nameError) {
        errors.name = nameError;
        isValid = false;
      }
      if (emailError) {
        errors.email = emailError;
        isValid = false;
      }
    } else if (step === 2) {
      const passwordError = validatePassword(password);
      const phoneError = validatePhone(phone);

      if (passwordError) {
        errors.password = passwordError;
        isValid = false;
      }
      if (phoneError) {
        errors.phone = phoneError;
        isValid = false;
      }
    } else if (step === 3) {
      const cityError = validateCity(city);
      const townshipError = validateTownship(township, city);

      if (cityError) {
        errors.city = cityError;
        isValid = false;
      }
      if (townshipError) {
        errors.township = townshipError;
        isValid = false;
      }
    }

    setValidationErrors(errors);
    return isValid;
  };

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
    // Validate all steps before submitting
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);

    if (!step1Valid || !step2Valid || !step3Valid) {
      Alert.alert(
        "Validation Error",
        "Please fix all validation errors before submitting"
      );
      return;
    }

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

  const clearError = (field: string) => {
    setValidationErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  React.useEffect(() => {
    if (registerMutation.isError) {
      Alert.alert(
        "Registration Failed",
        registerMutation.error?.message || "Failed to register"
      );
    }
  }, [registerMutation.isError, registerMutation.error]);

  // nextStep function (include validation)
  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1 && name.trim() && email.trim()) {
        setCurrentStep(2);
      } else if (currentStep === 2 && password.trim() && phone.trim()) {
        setCurrentStep(3);
      }
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
          className={`bg-white p-3 rounded-2xl border ${
            validationErrors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter your name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            clearError("name");
          }}
        />
        {validationErrors.name ? (
          <Text className="text-red-500 text-sm mt-1">
            {validationErrors.name}
          </Text>
        ) : null}
      </Box>

      <Box className="mb-6">
        <Text className="text-gray-700 mb-1">Email</Text>
        <TextInput
          className={`bg-white p-3 rounded-2xl border ${
            validationErrors.email ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter your email"
          keyboardType="email-address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearError("email");
          }}
        />
        {validationErrors.email ? (
          <Text className="text-red-500 text-sm mt-1">
            {validationErrors.email}
          </Text>
        ) : null}
      </Box>
    </>
  );

  // Step 2: Password and Phone
  const renderStep2 = () => (
    <>
      <Box className="mb-4 relative">
        <Text className="text-gray-700 mb-1">Password</Text>
        <TextInput
          className={`bg-white p-3 rounded-2xl border ${
            validationErrors.password ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            clearError("password");
          }}
        />
        {validationErrors.password ? (
          <Text className="text-red-500 text-sm mt-1">
            {validationErrors.password}
          </Text>
        ) : null}
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
          className={`bg-white p-3 rounded-2xl border ${
            validationErrors.phone ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            clearError("phone");
          }}
        />
        {validationErrors.phone ? (
          <Text className="text-red-500 text-sm mt-1">
            {validationErrors.phone}
          </Text>
        ) : null}
      </Box>
    </>
  );

  // Step 3: City and Township
  const renderStep3 = () => (
    <>
      <Box className="mb-4">
        <Text className="text-gray-700 mb-1">City</Text>
        <SelectList
          setSelected={(value: string) => {
            setCity(value);
            clearError("city");
          }}
          data={myanmarCities}
          placeholder="Search or select city..."
          searchPlaceholder="Search city..."
          boxStyles={{
            backgroundColor: "white",
            borderRadius: 12,
            borderColor: validationErrors.city ? "#ef4444" : "#d1d5db",
            borderWidth: 1,
          }}
          inputStyles={{ color: "#000" }}
          dropdownTextStyles={{ color: "#000" }}
        />
        {validationErrors.city ? (
          <Text className="text-red-500 text-sm mt-1">
            {validationErrors.city}
          </Text>
        ) : null}
      </Box>

      <Box className="mb-6">
        <Text className="text-gray-700 mb-1">Township</Text>
        <SelectList
          setSelected={(value: string) => {
            setTownship(value);
            clearError("township");
          }}
          data={filteredTownships}
          placeholder={
            city ? "Search or select township..." : "Please select a city first"
          }
          searchPlaceholder="Search township..."
          boxStyles={{
            backgroundColor: city ? "white" : "#f3f4f6",
            borderRadius: 12,
            opacity: city ? 1 : 0.6,
            borderColor: validationErrors.township ? "#ef4444" : "#d1d5db",
            borderWidth: 1,
          }}
          inputStyles={{ color: "#000" }}
          dropdownTextStyles={{ color: "#000" }}
        />
        {validationErrors.township ? (
          <Text className="text-red-500 text-sm mt-1">
            {validationErrors.township}
          </Text>
        ) : null}
      </Box>
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          flexGrow: 1,
          justifyContent: "center", // This centers the content vertically
        }}
      >
        {/* App Logo */}
        <Box className="items-center mb-8">
          <Image
            source={require("@/assets/images/app_logo.png")}
            className="w-[150px] h-[150px] mb-4"
            resizeMode="contain"
          />
        </Box>

        {/* Progress Indicator - Enhanced */}
        <Box className="flex-row justify-center items-center mb-6">
          {[1, 2, 3].map((step) => (
            <Box key={step} className="flex-row items-center">
              <Box
                className={`w-10 h-10 rounded-full items-center justify-center shadow-md ${
                  currentStep >= step ? "bg-blue-600" : "bg-gray-200"
                }`}
                style={{
                  borderWidth: 2,
                  borderColor: currentStep >= step ? "#60A5FA" : "#D1D5DB",
                  shadowColor: currentStep >= step ? "#3B82F6" : "#9CA3AF",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                  elevation: 4,
                }}
              >
                {currentStep > step ? (
                  <Ionicons name="checkmark" size={20} color="white" />
                ) : (
                  <Text
                    className={`font-bold text-base ${
                      currentStep >= step ? "text-white" : "text-gray-500"
                    }`}
                    style={{ fontFamily: "Z06-Walone-Bold" }}
                  >
                    {step}
                  </Text>
                )}
              </Box>
              {step < 3 && (
                <Box
                  className={`h-1 mx-2 ${
                    currentStep > step ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  style={{ width: 40 }}
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
              <Text
                className="text-blue-600 font-semibold"
                onPress={handleLoginPress}
              >
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
