import React, { useState, useCallback } from "react";
import {
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Linking,
  Image,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Add this before your component
const videoThumbnails = {
  "https://youtu.be/ivUKLr8q4sE?si=Ihoy9W5J-6pJKKtP": require("@/assets/images/flood-101-thumbnail.webp"),
  "https://youtu.be/cCZWkMXJwQE?si=QXsb-H7q5T1YvbM_": require("@/assets/images/risk-assessment-thumbnail.jpg"),
  "https://youtu.be/43M5mZuzHF8?si=bjAf3CwBrjvSiiX5": require("@/assets/images/emergency-preparedness-thumbnail.jpg"),
  "https://youtu.be/pi_nUPcQz_A?si=nTaK05UGqVwQQYcI": require("@/assets/images/prepare-flood-thumbnail.jpg"),
  "https://youtu.be/rV1iqRD9EKY?si=Q5gUX-Aq-jEvqCa3": require("@/assets/images/during-flood-thumbnail.jpg"),
  "https://youtu.be/cqCMXSOo8qc?si=djeRXyfCFzBX_yuP": require("@/assets/images/flood-safety-thumbnail.jpg"),
  "https://youtube.com/shorts/Xq8ZHcI49es?si=miD2etNlHizqEGUC": require("@/assets/images/flood-proof-home-thumbnail.jpg"),
  "https://youtu.be/7b0p5ZzN524?si=aFyoyEOX_kM_y_uK": require("@/assets/images/sandbagging-thumbnail.jpg"),
  "https://youtu.be/Qdtii023TdA?si=gg7Rnce2HqiOAp4J": require("@/assets/images/post-flood-thumbnail.jpg"),
  "https://youtu.be/vnzlQ3l05Xs?si=hjNhGgSuXLujgE5B": require("@/assets/images/flood-cleanup-thumbnail.jpg"),
  "https://youtu.be/W6E_ePBCzOA?si=Vn_gHYykmvUyMfMT": require("@/assets/images/first-aid-thumbnail.jpg"),
  "https://youtu.be/26n4DWNPzvM?si=P0mXAUteaine9C_C": require("@/assets/images/waterborne-diseases-thumbnail.jpg"),
};

// Fallback gradient colors for each section
const sectionColors = {
  1: ["from-red-500", "to-red-700"],
  2: ["from-blue-500", "to-blue-700"],
  3: ["from-cyan-500", "to-cyan-700"],
  4: ["from-green-500", "to-green-700"],
  5: ["from-purple-500", "to-purple-700"],
  6: ["from-pink-500", "to-pink-700"],
};

const Guide = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  // Function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
};

  const educationalContent = [
    {
      id: 1,
      title: "Understanding Flood Risks",
      icon: "warning",
      color: "bg-red-500",
      videos: [
        {
          title: "Flooding 101 - Understanding Flood Risk",
          url: "https://youtu.be/ivUKLr8q4sE?si=Ihoy9W5J-6pJKKtP",
          duration: "4:30"
        },
        {
          title: "Flood Risk Assessment and Management",
          url: "https://youtu.be/cCZWkMXJwQE?si=QXsb-H7q5T1YvbM_",
          duration: "6:15"
        }
      ],
      guidelines: [
        "Know your area's flood risk level",
        "Understand flash flood warnings",
        "Identify flood-prone zones in your community",
        "Monitor weather forecasts regularly"
      ]
    },
    {
      id: 2,
      title: "Emergency Preparedness",
      icon: "shield-checkmark",
      color: "bg-blue-500",
      videos: [
        {
          title: "Emergency Preparedness: Floods",
          url: "https://youtu.be/43M5mZuzHF8?si=bjAf3CwBrjvSiiX5",
          duration: "5:45"
        },
        {
          title: "How to Prepare for a Flood",
          url: "https://youtu.be/pi_nUPcQz_A?si=nTaK05UGqVwQQYcI",
          duration: "7:20"
        }
      ],
      guidelines: [
        "Create a 72-hour emergency kit",
        "Establish family communication plan",
        "Learn evacuation routes",
        "Keep important documents waterproof",
        "Practice evacuation drills quarterly"
      ]
    },
    {
      id: 3,
      title: "During a Flood",
      icon: "water",
      color: "bg-cyan-500",
      videos: [
        {
          title: "What to Do During a Flood",
          url: "https://youtu.be/rV1iqRD9EKY?si=Q5gUX-Aq-jEvqCa3",
          duration: "3:50"
        },
        {
          title: "Flood Safety Tips",
          url: "https://youtu.be/cqCMXSOo8qc?si=djeRXyfCFzBX_yuP",
          duration: "4:15"
        }
      ],
      guidelines: [
        "Move to higher ground immediately",
        "Avoid walking or driving through flood waters",
        "Stay away from electrical equipment",
        "Follow evacuation orders without delay",
        "Do not attempt to swim through flood waters"
      ]
    },
    {
      id: 4,
      title: "Home Protection",
      icon: "home",
      color: "bg-green-500",
      videos: [
        {
          title: "How to Flood-Proof Your Home",
          url: "https://youtube.com/shorts/Xq8ZHcI49es?si=miD2etNlHizqEGUC",
          duration: "8:30"
        },
        {
          title: "Sandbagging for Flood Protection",
          url: "https://youtu.be/7b0p5ZzN524?si=aFyoyEOX_kM_y_uK",
          duration: "6:45"
        }
      ],
      guidelines: [
        "Install check valves in plumbing",
        "Waterproof basement walls",
        "Elevate electrical systems",
        "Anchor fuel tanks",
        "Clear gutters and drains regularly"
      ]
    },
    {
      id: 5,
      title: "After Flood Safety",
      icon: "medical",
      color: "bg-purple-500",
      videos: [
        {
          title: "Post-Flood Recovery Guide",
          url: "https://youtu.be/Qdtii023TdA?si=gg7Rnce2HqiOAp4J",
          duration: "9:15"
        },
        {
          title: "Flood Cleanup and Safety",
          url: "https://youtu.be/vnzlQ3l05Xs?si=hjNhGgSuXLujgE5B",
          duration: "7:30"
        }
      ],
      guidelines: [
        "Wait for official clearance to return",
        "Check for structural damage",
        "Document damage for insurance",
        "Disinfect contaminated items",
        "Watch for mold growth",
        "Test drinking water safety"
      ]
    },
    {
      id: 6,
      title: "First Aid & Health",
      icon: "medkit",
      color: "bg-pink-500",
      videos: [
        {
          title: "First Aid for Flood-Related Injuries",
          url: "https://youtu.be/W6E_ePBCzOA?si=Vn_gHYykmvUyMfMT",
          duration: "5:20"
        },
        {
          title: "Waterborne Diseases After Flooding",
          url: "https://youtu.be/26n4DWNPzvM?si=P0mXAUteaine9C_C",
          duration: "6:40"
        }
      ],
      guidelines: [
        "Treat wounds immediately to prevent infection",
        "Watch for signs of waterborne diseases",
        "Maintain personal hygiene",
        "Use protective gear during cleanup",
        "Seek medical attention for any symptoms"
      ]
    }
  ];

  const emergencyContacts = [
    { name: "Emergency Services", number: "911", icon: "alert-circle" },
    { name: "Flood Helpline", number: "09 450 065 964", icon: "call" },
    { name: "Local Emergency", number: "+95 9 431 59737", icon: "business" },
    { name: "Power Outage", number: "1-800-POWERON", icon: "flash" }
  ];

  const toggleSection = useCallback((sectionId: number) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  }, [expandedSection]);

  const openVideo = useCallback((url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  }, []);

  const callEmergency = useCallback((number: string) => {
    Linking.openURL(`tel:${number}`);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Heading className="text-blue-700 text-3xl font-bold mb-2 text-left">
          Flood Safety Education
        </Heading>
        <Text className="text-gray-600 text-left mb-6">
          Complete Guide for Preparedness and Response
        </Text>

        {/* Emergency Contacts */}
        <Box className="mb-6">
          <Heading className="text-xl font-bold text-gray-800 mb-4">
            Emergency Contacts
          </Heading>
          <Box className="flex-row flex-wrap justify-between">
            {emergencyContacts.map((contact, index) => (
              <TouchableOpacity 
                key={index}
                className="w-[48%] bg-white p-4 rounded-2xl border border-gray-200 mb-3 shadow-sm"
                onPress={() => callEmergency(contact.number)}
              >
                <Box className="items-center">
                  <Ionicons name={contact.icon} size={24} color="#ef4444" />
                  <Text className="text-gray-800 font-semibold mt-2 text-center">
                    {contact.name}
                  </Text>
                  <Text className="text-red-500 font-bold text-sm mt-1">
                    {contact.number}
                  </Text>
                </Box>
              </TouchableOpacity>
            ))}
          </Box>
        </Box>

        {/* Educational Sections */}
        {educationalContent.map((section) => (
          <Box key={section.id} className="bg-white rounded-2xl p-4 mb-4 border border-gray-200 shadow-sm">
            <TouchableOpacity 
              className="flex-row items-center justify-between"
              onPress={() => toggleSection(section.id)}
            >
              <Box className="flex-row items-center">
                <Box className={`w-10 h-10 rounded-full ${section.color} items-center justify-center mr-3`}>
                  <Ionicons name={section.icon} size={20} color="white" />
                </Box>
                <Heading className="text-lg font-bold text-gray-800">
                  {section.title}
                </Heading>
              </Box>
              <Ionicons 
                name={expandedSection === section.id ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="#6b7280" 
              />
            </TouchableOpacity>

            {expandedSection === section.id && (
              <Box className="mt-4">
               {/* Video Lectures */}
<Text className="text-gray-700 font-semibold mb-3">Video Lectures</Text>
<Box className="mb-4">
  {section.videos.map((video, index) => {
    const thumbnailSource = videoThumbnails[video.url];
    const [fromColor, toColor] = sectionColors[section.id] || ["from-blue-500", "to-purple-600"];

    return (
      <TouchableOpacity 
        key={index}
        className="mb-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        onPress={() => openVideo(video.url)}
        activeOpacity={0.7}
      >
        {/* Thumbnail Container */}
        <Box className="relative">
          {thumbnailSource ? (
            // Local Image Thumbnail
            <Image 
              source={thumbnailSource}
              className="w-full h-48"
              resizeMode="cover"
            />
          ) : (
            // Fallback Gradient
            <Box className={`w-full h-48 bg-gradient-to-br ${fromColor} ${toColor} items-center justify-center`}>
              <Box className="bg-black bg-opacity-30 rounded-full p-4">
                <Ionicons name="play" size={32} color="white" />
              </Box>
            </Box>
          )}
          
          {/* Play Button Overlay */}
          <Box className="absolute inset-0 items-center justify-center">
            <Box className="bg-black bg-opacity-40 rounded-full p-3">
              <Ionicons name="play" size={24} color="white" />
            </Box>
          </Box>
          
          {/* Duration Badge */}
          <Box className="absolute top-3 right-3 bg-black bg-opacity-80 px-2 py-1 rounded">
            <Text className="text-white text-xs font-medium">
              {video.duration}
            </Text>
          </Box>
        </Box>
        
        {/* Video Info */}
        <Box className="p-4">
          <Text className="text-gray-800 font-bold text-base mb-2">
            {video.title}
          </Text>
          
          <Box className="flex-row items-center">
            <Box className="w-6 h-6 bg-red-500 rounded-full items-center justify-center mr-2">
              <Ionicons name="play-circle" size={12} color="white" />
            </Box>
            <Text className="text-gray-600 text-sm">
              Flood Safety Education
            </Text>
            <Text className="text-gray-400 text-sm mx-2">•</Text>
            <Text className="text-gray-500 text-sm">Tap to watch</Text>
          </Box>
        </Box>
      </TouchableOpacity>
    );
  })}
</Box>

                {/* Guidelines */}
                <Text className="text-gray-700 font-semibold mb-3">Safety Guidelines</Text>
                <Box className="bg-green-50 p-3 rounded-xl">
                  {section.guidelines.map((guideline, index) => (
                    <Box key={index} className="flex-row items-start mb-2">
                      <Ionicons name="checkmark-circle" size={16} color="#10b981" className="mt-1" />
                      <Text className="text-gray-700 ml-2 flex-1">
                        {guideline}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ))}

        {/* Quick Action Tips */}
        <Box className="bg-white rounded-2xl p-4 mb-4 border border-gray-200 shadow-sm">
          <Heading className="text-xl font-bold text-gray-800 mb-4">
            Quick Action Tips
          </Heading>
          <Box className="flex-row flex-wrap justify-between">
            <Box className="w-[48%] bg-orange-50 p-4 rounded-xl items-center mb-3">
              <Ionicons name="volume-high" size={24} color="#f59e0b" />
              <Text className="text-gray-800 font-semibold mt-2 text-center text-sm">
                Stay Informed
              </Text>
            </Box>
            <Box className="w-[48%] bg-red-50 p-4 rounded-xl items-center mb-3">
              <Ionicons name="walk" size={24} color="#ef4444" />
              <Text className="text-gray-800 font-semibold mt-2 text-center text-sm">
                Evacuate Early
              </Text>
            </Box>
            <Box className="w-[48%] bg-green-50 p-4 rounded-xl items-center">
              <Ionicons name="battery-charging" size={24} color="#10b981" />
              <Text className="text-gray-800 font-semibold mt-2 text-center text-sm">
                Charge Devices
              </Text>
            </Box>
            <Box className="w-[48%] bg-blue-50 p-4 rounded-xl items-center">
              <Ionicons name="document-text" size={24} color="#3b82f6" />
              <Text className="text-gray-800 font-semibold mt-2 text-center text-sm">
                Keep Documents Safe
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Emergency Kit Checklist */}
        <Box className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <Heading className="text-xl font-bold text-gray-800 mb-4">
            Emergency Kit Checklist
          </Heading>
          <Box className="bg-gray-50 p-4 rounded-xl">
            {[
              "Water (1 gallon per person per day)",
              "Non-perishable food (3-day supply)",
              "First aid kit",
              "Flashlight with extra batteries",
              "Portable radio",
              "Medications (7-day supply)",
              "Personal hygiene items",
              "Multi-tool",
              "Emergency blankets",
              "Important documents copies",
              "Cash",
              "Phone charger & power bank"
            ].map((item, index) => (
              <Box key={index} className="flex-row items-center mb-2">
                <Ionicons name="square-outline" size={20} color="#6b7280" />
                <Text className="text-gray-700 ml-3 flex-1">
                  {item}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Guide;