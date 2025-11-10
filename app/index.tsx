import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Droplet } from "lucide-react-native";
import { useAuthStore } from "@/stores/auth-store";

export default function Index() {
  const router = useRouter();
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate().catch(() => {});
    const timer = setTimeout(() => {
      router.replace("/tabs/home");
    }, 100);

    return () => clearTimeout(timer);
  }, [router, hydrate]);

  return (
    <Box className="flex-1 bg-blue-500 items-center justify-center">
      <VStack space="lg" className="items-center">
        <Droplet size={64} color="#FFFFFF" />
        <Heading className="text-white text-3xl font-bold">Flood Sync</Heading>
        <Text className="text-blue-100 text-lg">Loading...</Text>
      </VStack>
    </Box>
  );
}
