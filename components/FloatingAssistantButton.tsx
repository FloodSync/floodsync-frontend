import React from 'react';
import { TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { GuideModal } from './GuideModal';

interface FloatingAssistantButtonProps {
  children: React.ReactNode;
}

export const FloatingAssistantButton: React.FC<FloatingAssistantButtonProps> = ({ children }) => {
  const [isGuideVisible, setIsGuideVisible] = React.useState(false);
  const pathname = usePathname();

  // Hide floating button on login and register screens
  const shouldShowButton = !pathname?.includes('/login') && !pathname?.includes('/register');

  return (
    <>
      {children}
      
      {/* Floating Button - Conditionally Rendered */}
      {shouldShowButton && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            right: 10,
            bottom: 65,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#3b82f6',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            zIndex: 1000,
          }}
          onPress={() => setIsGuideVisible(true)}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Guide(Chat Guideline) Modal */}
      <Modal
        visible={isGuideVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsGuideVisible(false)}
      >
        <GuideModal onClose={() => setIsGuideVisible(false)} />
      </Modal>
    </>
  );
};