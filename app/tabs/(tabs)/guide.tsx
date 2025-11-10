import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { ScrollView } from "@/components/ui/scroll-view";
import React from "react";

const Guide = () => {
  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <Box className="flex-1">
        <Heading className="text-white text-3xl font-bold">Guide</Heading>
      </Box>
    </SafeAreaView>
  );
};

export default Guide;
