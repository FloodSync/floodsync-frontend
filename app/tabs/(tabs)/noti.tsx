import React from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { ScrollView } from '@/components/ui/scroll-view';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Card } from '@/components/ui/card';
import { Bell, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react-native';

export default function NotiScreen() {
  const notifications = [
    {
      id: 1,
      type: 'alert',
      title: 'Flood Warning: High Risk Area',
      message: 'Water levels are rising rapidly in the downtown area. Please evacuate immediately.',
      time: '5 minutes ago',
      icon: AlertTriangle,
      color: '#EF4444',
      bgColor: 'bg-red-100',
    },
    {
      id: 2,
      type: 'info',
      title: 'Safe Zone Available',
      message: 'Community Center is open as a safe zone. Food and shelter provided.',
      time: '1 hour ago',
      icon: CheckCircle,
      color: '#10B981',
      bgColor: 'bg-green-100',
    },
    {
      id: 3,
      type: 'info',
      title: 'Weather Update',
      message: 'Heavy rainfall expected in the next 24 hours. Stay prepared.',
      time: '3 hours ago',
      icon: Info,
      color: '#3B82F6',
      bgColor: 'bg-blue-100',
    },
    {
      id: 4,
      type: 'success',
      title: 'Alert Resolved',
      message: 'Water levels have normalized in Riverside Park. Area is now safe.',
      time: '5 hours ago',
      icon: CheckCircle,
      color: '#10B981',
      bgColor: 'bg-green-100',
    },
    {
      id: 5,
      type: 'warning',
      title: 'Moderate Risk Alert',
      message: 'Increased water levels detected in North District. Monitor closely.',
      time: '1 day ago',
      icon: AlertTriangle,
      color: '#F59E0B',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <Box className="flex-1">
        {/* Header */}
        <Box className="bg-blue-500 px-6 py-6 shadow-md">
          <HStack className="items-center justify-between">
            <VStack>
              <Heading className="text-white text-3xl font-bold">Notifications</Heading>
              <Text className="text-blue-100 text-base mt-1">
                Stay informed about flood alerts
              </Text>
            </VStack>
            <Bell size={28} color="#FFFFFF" />
          </HStack>
        </Box>

        {/* Notifications List */}
        <ScrollView className="flex-1">
          <Box className="px-4 py-6">
            <VStack space="md">
              {notifications.map((notification) => {
                const IconComponent = notification.icon;
                return (
                  <Card
                    key={notification.id}
                    className="bg-white rounded-xl p-4 shadow-md border-l-4"
                    style={{ borderLeftColor: notification.color }}
                  >
                    <HStack space="md" className="items-start">
                      <Box className={`${notification.bgColor} rounded-full p-2`}>
                        <IconComponent size={24} color={notification.color} />
                      </Box>
                      <VStack className="flex-1">
                        <Text className="text-gray-900 font-semibold text-base">
                          {notification.title}
                        </Text>
                        <Text className="text-gray-600 text-sm mt-1">
                          {notification.message}
                        </Text>
                        <Text className="text-blue-500 text-xs mt-2">
                          {notification.time}
                        </Text>
                      </VStack>
                    </HStack>
                  </Card>
                );
              })}
            </VStack>

            {/* Empty State (if no notifications) */}
            {notifications.length === 0 && (
              <Box className="items-center justify-center py-12">
                <Bell size={64} color="#9CA3AF" />
                <Text className="text-gray-500 text-lg mt-4 font-semibold">
                  No notifications
                </Text>
                <Text className="text-gray-400 text-sm mt-2 text-center">
                  You're all caught up!
                </Text>
              </Box>
            )}
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

