import React from "react";
import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen
        name="register"
        options={{
          headerBackButtonDisplayMode: "minimal",
          headerBackVisible: true,
          headerTitle: "",
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="login"
        options={{
          headerBackButtonDisplayMode: "minimal",
          headerBackVisible: true,
          headerTitle: "",
          headerTransparent: true,
        }}
      />

      <Stack.Screen name="account-created" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
