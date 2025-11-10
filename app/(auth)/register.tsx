import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import React from "react";
import { View, Text, SafeAreaView } from "react-native";

const Register = () => {
  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <Box className="flex-1">
        <Heading className="text-white text-3xl font-bold">Register</Heading>
      </Box>
    </SafeAreaView>
  );
};

export default Register;
