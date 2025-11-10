import React from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { ScrollView } from '@/components/ui/scroll-view';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { MapPin, AlertCircle, Droplet } from 'lucide-react-native';

export default function MapScreen() {
  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <Box className="flex-1">
        {/* Header */}
        <Box className="bg-blue-500 px-6 py-4 shadow-md">
          <HStack className="items-center justify-between">
            <VStack>
              <Heading className="text-white text-2xl font-bold">Flood Sync</Heading>
              <Text className="text-blue-100 text-sm mt-1">Community Flood Monitoring</Text>
            </VStack>
            <MapPin size={28} color="#FFFFFF" />
          </HStack>
        </Box>

        {/* Map Container */}
        <Box className="flex-1 bg-blue-200 m-4 rounded-2xl shadow-lg overflow-hidden">
          <Box className="flex-1 items-center justify-center bg-blue-200">
            <VStack space="md" className="items-center">
              <MapPin size={64} color="#3B82F6" />
              <Text className="text-blue-700 text-lg font-semibold">Interactive Map</Text>
              <Text className="text-blue-600 text-center px-6">
                View real-time flood alerts and community reports
              </Text>
            </VStack>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Box className="px-4 pb-4">
          <HStack space="md">
            <Box className="flex-1 bg-white rounded-xl p-4 shadow-md">
              <HStack space="sm" className="items-center">
                <AlertCircle size={24} color="#EF4444" />
                <VStack className="flex-1">
                  <Text className="text-gray-600 text-xs">Active Alerts</Text>
                  <Text className="text-gray-900 text-xl font-bold">12</Text>
                </VStack>
              </HStack>
            </Box>
            <Box className="flex-1 bg-white rounded-xl p-4 shadow-md">
              <HStack space="sm" className="items-center">
                <Droplet size={24} color="#3B82F6" />
                <VStack className="flex-1">
                  <Text className="text-gray-600 text-xs">Water Level</Text>
                  <Text className="text-gray-900 text-xl font-bold">Normal</Text>
                </VStack>
              </HStack>
            </Box>
          </HStack>
        </Box>
      </Box>
    </SafeAreaView>
  );
}

