import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import React from "react";
import { View, Text, SafeAreaView } from "react-native";

const Login = () => {
  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <Box className="flex-1">
        <Heading className="text-white text-3xl font-bold">

          <Text>Login Page</Text>
        </Heading>
      </Box>
    </SafeAreaView>
  );
};

export default Login;
