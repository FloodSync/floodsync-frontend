import React, { useState, useCallback, useMemo } from "react";
import {
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Linking,
  Image,
  View
} from "react-native";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { Ionicons } from "@expo/vector-icons";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import {
  MapPin,
  User,
} from "lucide-react-native";
import { APP_CONFIG, isDemoMode } from "@/lib/config/app-config";
import { useAuthStore } from "@/stores/auth-store";
import { useLocation } from "@/hooks/use-location";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLogout } from "@/hooks/use-auth";
import { router } from "expo-router";
import { useLanguage } from "@/contexts/LanguageContext";
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';

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

const offlineVideos = {
  "https://youtu.be/ivUKLr8q4sE?si=Ihoy9W5J-6pJKKtP": require("@/assets/videos/flood-101.mp4"),
  "https://youtu.be/cCZWkMXJwQE?si=QXsb-H7q5T1YvbM_": require("@/assets/videos/risk-assessment.mp4"),
  "https://youtu.be/43M5mZuzHF8?si=bjAf3CwBrjvSiiX5": require("@/assets/videos/emergency-preparedness.mp4"),
  "https://youtu.be/pi_nUPcQz_A?si=nTaK05UGqVwQQYcI": require("@/assets/videos/prepare-flood.mp4"),
  "https://youtu.be/rV1iqRD9EKY?si=Q5gUX-Aq-jEvqCa3": require("@/assets/videos/during-flood.mp4"),
  "https://youtu.be/cqCMXSOo8qc?si=djeRXyfCFzBX_yuP": require("@/assets/videos/flood-safety.mp4"),
  "https://youtube.com/shorts/Xq8ZHcI49es?si=miD2etNlHizqEGUC": require("@/assets/videos/flood-proof-home.mp4"),
  "https://youtu.be/7b0p5ZzN524?si=aFyoyEOX_kM_y_uK": require("@/assets/videos/sandbagging.mp4"),
  "https://youtu.be/Qdtii023TdA?si=gg7Rnce2HqiOAp4J": require("@/assets/videos/post-flood.mp4"),
  "https://youtu.be/vnzlQ3l05Xs?si=hjNhGgSuXLujgE5B": require("@/assets/videos/flood-cleanup.mp4"),
  "https://youtu.be/W6E_ePBCzOA?si=Vn_gHYykmvUyMfMT": require("@/assets/videos/first-aid.mp4"),
  "https://youtu.be/26n4DWNPzvM?si=P0mXAUteaine9C_C": require("@/assets/videos/waterborne-diseases.mp4"),
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

// Video Player Component
const VideoPlayerComponent = React.memo(({ 
  video, 
  sectionId,
  videoStates,
  currentPlayingVideo,
  onTogglePlayback,
  onStopVideo 
}: { 
  video: any;
  sectionId: number;
  videoStates: any;
  currentPlayingVideo: string | null;
  onTogglePlayback: (videoUrl: string) => void;
  onStopVideo: (videoUrl: string) => void;
}) => {
  const videoRef = React.useRef<Video>(null);
  const videoUrl = video.url;
  const videoState = videoStates[videoUrl] || { isPlaying: false, showControls: false };
  const offlineVideoSource = offlineVideos[videoUrl];
  const thumbnailSource = videoThumbnails[videoUrl];
  const [fromColor, toColor] = sectionColors[sectionId] || ["from-blue-500", "to-purple-600"];

  React.useEffect(() => {
    if (currentPlayingVideo && currentPlayingVideo !== videoUrl && videoState.isPlaying) {
      onTogglePlayback(videoUrl);
    }
  }, [currentPlayingVideo, videoUrl, videoState.isPlaying]);

  const handleVideoPress = () => {
    if (offlineVideoSource) {
      onTogglePlayback(videoUrl);
    } else {
      Linking.openURL(videoUrl).catch(err => console.error('Failed to open URL:', err));
    }
  };

  if (!offlineVideoSource) {
    return (
      <TouchableOpacity 
        className="mb-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        onPress={handleVideoPress}
        activeOpacity={0.7}
      >
        <Box className="relative">
          {thumbnailSource ? (
            <Image 
              source={thumbnailSource}
              className="w-full h-48"
              resizeMode="cover"
            />
          ) : (
            <Box className={`w-full h-48 bg-gradient-to-br ${fromColor} ${toColor} items-center justify-center`}>
              <Box className="bg-black bg-opacity-30 rounded-full p-4">
                <Ionicons name="play" size={32} color="white" />
              </Box>
            </Box>
          )}
          
          <Box className="absolute inset-0 items-center justify-center">
            <Box className="bg-black bg-opacity-40 rounded-full p-3">
              <Ionicons name="play" size={24} color="white" />
            </Box>
          </Box>
          
          <Box className="absolute top-3 right-3 bg-black bg-opacity-80 px-2 py-1 rounded">
            <Text className="text-white text-xs font-medium">
              {video.duration}
            </Text>
          </Box>
        </Box>
        
        <Box className="p-4">
          <Text className="text-gray-800 font-bold text-base mb-2" style={{ fontFamily: "Z06-Walone-Bold" }}>
            {video.title}
          </Text>
          
          <Box className="flex-row items-center">
            <Box className="w-6 h-6 bg-red-500 rounded-full items-center justify-center mr-2">
              <Ionicons name="play-circle" size={12} color="white" />
            </Box>
            <Text className="text-gray-600 text-sm" style={{ fontFamily: "Z06-Walone-Bold" }}>
              Flood Safety Education
            </Text>
            <Text className="text-gray-400 text-sm mx-2">•</Text>
            <Text className="text-gray-500 text-sm" style={{ fontFamily: "Z06-Walone-Bold" }}>Tap to Watch Online</Text>
          </Box>
        </Box>
      </TouchableOpacity>
    );
  }

  return (
    <Box className="mb-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Box className="relative">
        <Video
          ref={videoRef}
          source={offlineVideoSource}
          style={{ width: '100%', height: 200 }}
          resizeMode="cover"
          shouldPlay={videoState.isPlaying}
          isLooping={false}
          useNativeControls={videoState.showControls}
          onPlaybackStatusUpdate={(status: any) => {
            if (status.didJustFinish) {
              onStopVideo(videoUrl);
            }
          }}
        />
        
        {!videoState.showControls && (
          <Pressable 
            className="absolute inset-0 items-center justify-center"
            onPress={() => onTogglePlayback(videoUrl)}
          >
            <Box className="bg-black bg-opacity-40 rounded-full p-4">
              <Ionicons 
                name={videoState.isPlaying ? "pause" : "play"} 
                size={32} 
                color="white" 
              />
            </Box>
          </Pressable>
        )}
        
        <Box className="absolute top-3 right-3 bg-black bg-opacity-80 px-2 py-1 rounded">
          <Text className="text-white text-xs font-medium">
            {video.duration}
          </Text>
        </Box>
      </Box>
      
      <Box className="p-4">
        <Text className="text-gray-800 font-bold text-base mb-2" style={{ fontFamily: "Z06-Walone-Bold" }}>
          {video.title}
        </Text>
        
        <Box className="flex-row items-center">
          <Box className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-2">
            <Ionicons name="play-circle" size={12} color="white" />
          </Box>
          <Text className="text-gray-600 text-sm" style={{ fontFamily: "Z06-Walone-Bold" }}>
            Flood Safety Education
          </Text>
          <Text className="text-gray-400 text-sm mx-2">•</Text>
          <Text className="text-green-600 text-sm" style={{ fontFamily: "Z06-Walone-Bold" }}>
            Offline Available
          </Text>
        </Box>
        
        {videoState.showControls && (
          <Box className="flex-row justify-center mt-3 space-x-4">
            <Pressable onPress={() => onTogglePlayback(videoUrl)}>
              <Ionicons 
                name={videoState.isPlaying ? "pause-circle" : "play-circle"} 
                size={32} 
                color="#3b82f6" 
              />
            </Pressable>
            <Pressable onPress={() => onStopVideo(videoUrl)}>
              <Ionicons name="stop-circle" size={32} color="#ef4444" />
            </Pressable>
          </Box>
        )}
      </Box>
    </Box>
  );
});

const Guide = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();
  const {
      coordinates,
      loading: locationLoading,
      error: locationError,
    } = useLocation();
  const { t } = useLanguage();

  const [videoStates, setVideoStates] = useState<{[key: string]: {isPlaying: boolean; showControls: boolean}}>({});
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState<string | null>(null);

  const educationalContent = [
    {
      id: 1,
      title: t("understandingFloodRisks"),
      icon: "warning",
      color: "bg-red-500",
      videos: [
        {
          title: t("flooding101"),
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
        t("knowYourAreasFloodRiskLevel"),
        t("understandFlashFloodWarnings"),
        t("identifyFloodZonesInYourCommunity"),
        t("monitorWeatherForecastRegularly")
      ]
    },
    {
      id: 2,
      title: t("emergencyPreparedness"),
      icon: "shield-checkmark",
      color: "bg-blue-500",
      videos: [
        {
          title: t("emergencyPreparednessFlood"),
          url: "https://youtu.be/43M5mZuzHF8?si=bjAf3CwBrjvSiiX5",
          duration: "5:45"
        },
        {
          title: t("howToPrepareForAFlood"),
          url: "https://youtu.be/pi_nUPcQz_A?si=nTaK05UGqVwQQYcI",
          duration: "7:20"
        }
      ],
      guidelines: [
        t("create72hourEmergencyKit"),
        t("establishmentFamilyCommunicationPlan"),
        t("learnEvacuationRoutes"),
        t("keepImportantDocumentsWaterProof"),
        t("practiceEvacuationDrillsQuarterly")
      ]
    },
    {
      id: 3,
      title: t("duringAFlood"),
      icon: "water",
      color: "bg-cyan-500",
      videos: [
        {
          title: t("whatToDoDuringAFlood"),
          url: "https://youtu.be/rV1iqRD9EKY?si=Q5gUX-Aq-jEvqCa3",
          duration: "3:50"
        },
        {
          title: t("floodSafetyTips"),
          url: "https://youtu.be/cqCMXSOo8qc?si=djeRXyfCFzBX_yuP",
          duration: "4:15"
        }
      ],
      guidelines: [
        t("moveToHigherGroundImmediately"),
        t("avoidWalkingOrDrivingThroughFlood"),
        t("stayAwayFromElectricialEquipment"),
        t("withoutEvacuationOrdersWithoutDelay"),
        t("doNotSwimThroughFloodWater")
      ]
    },
    {
      id: 4,
      title: t("homeProtection"),
      icon: "home",
      color: "bg-green-500",
      videos: [
        {
          title: t("howToFloodProofYourHome"),
          url: "https://youtube.com/shorts/Xq8ZHcI49es?si=miD2etNlHizqEGUC",
          duration: "8:30"
        },
        {
          title: t("sandBaggingForFloodProtection"),
          url: "https://youtu.be/7b0p5ZzN524?si=aFyoyEOX_kM_y_uK",
          duration: "6:45"
        }
      ],
      guidelines: [
        t("installCheckValuesInPlumbing"),
        t("waterproofBasementWalls"),
        t("elevateElectricalSystem"),
        t("anchorFuelTanks"),
        t("clearGuttersAndDrainsRegularly")
      ]
    },
    {
      id: 5,
      title: t("afterFloodSafety"),
      icon: "medical",
      color: "bg-purple-500",
      videos: [
        {
          title: t("postFloodRecoveryGuide"),
          url: "https://youtu.be/Qdtii023TdA?si=gg7Rnce2HqiOAp4J",
          duration: "9:15"
        },
        {
          title: t("floodCleanupandSafety"),
          url: "https://youtu.be/vnzlQ3l05Xs?si=hjNhGgSuXLujgE5B",
          duration: "7:30"
        }
      ],
      guidelines: [
        t("waitForOfficialClearanceToReturn"),
        t("checkForStructuralDamage"),
        t("documentDamageForInsurance"),
        t("disinfectContaminatedItems"),
        t("watchForMoldGrowth"),
        t("testDrinkingWaterSafety")
      ]
    },
    {
      id: 6,
      title: t("firstAidAndHealth"),
      icon: "medkit",
      color: "bg-pink-500",
      videos: [
        {
          title: t("firstAidForFloodRelatedInjuries"),
          url: "https://youtu.be/W6E_ePBCzOA?si=Vn_gHYykmvUyMfMT",
          duration: "5:20"
        },
        {
          title: t("waterBorneDiseaseAfterFlooding"),
          url: "https://youtu.be/26n4DWNPzvM?si=P0mXAUteaine9C_C",
          duration: "6:40"
        }
      ],
      guidelines: [
        t("treatWondsImmediatelyToPreventInfection"),
        t("watchForSignsOfWaterBorneDisease"),
        t("maintainPersonalHygiene"),
        t("useProtectiveGearDuringCleanup"),
        t("seekMedicalAttentionForAnySyn")
      ]
    }
  ];

  const emergencyContacts = [
    { name: t("emergencyServices"), number: t("nineOneOne"), icon: "alert-circle" },
    { name: t("floodHelpline"), number: t("floodCall"), icon: "call" },
    { name: t("localEmergency"), number: t("localCall"), icon: "business" },
    { name: t("powerOutage"), number: t("powerRon"), icon: "flash" }
  ];

  const toggleSection = useCallback((sectionId: number) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  }, [expandedSection]);

  const callEmergency = useCallback((number: string) => {
    Linking.openURL(`tel:${number}`);
  }, []);

  const userLocation = useMemo(() => {
      if (isDemoMode()) {
        return APP_CONFIG.DEMO_DATA.location;
      }
  
      if (isAuthenticated && user) {
        return `${user.city}, ${user.township}`;
      }
      if (coordinates?.city) {
        if (coordinates.township) {
          return `${coordinates.city}, ${coordinates.township}`;
        }
        return coordinates.city;
      }
      if (coordinates) {
        return `${coordinates.latitude.toFixed(2)}, ${coordinates.longitude.toFixed(2)}`;
      }
      return "Getting location...";
    }, [isAuthenticated, user, coordinates]);

  const handleProfilePress = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const handleLoginPress = useCallback(() => {
    router.push("/(auth)/login");
  }, []);

  const toggleVideoPlayback = useCallback((videoUrl: string) => {
    setVideoStates(prev => {
      const currentState = prev[videoUrl];
      const newIsPlaying = !currentState?.isPlaying;
      
      if (newIsPlaying) {
        setCurrentPlayingVideo(videoUrl);
      } else if (currentPlayingVideo === videoUrl) {
        setCurrentPlayingVideo(null);
      }
      
      return {
        ...prev,
        [videoUrl]: {
          isPlaying: newIsPlaying,
          showControls: true
        }
      };
    });
  }, [currentPlayingVideo]);

  const stopVideo = useCallback((videoUrl: string) => {
    setVideoStates(prev => ({
      ...prev,
      [videoUrl]: {
        isPlaying: false,
        showControls: false
      }
    }));
    if (currentPlayingVideo === videoUrl) {
      setCurrentPlayingVideo(null);
    }
  }, [currentPlayingVideo]);

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>

        <Heading className="text-blue-700 text-2xl font-medium mb-2 text-left mt-3"
        style={{ fontFamily: "Z06-Walone-Bold" }}
        >
          {t("floodSafetyEducation")}
        </Heading>
        <Text className="text-gray-600 text-left mb-6"
        style={{ fontFamily: "Z06-Walone-Bold" }}
        >
          {t("completeGuideForPreparednessAndResponse")}
        </Text>

        {/* Emergency Contacts */}
        <Box className="mb-6">
          <Heading className="text-xl font-medium text-gray-800 mb-4" style={{ fontFamily: "Z06-Walone-Bold" }}>
            {t("emergencyContacts")}
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
                  <Text className="text-gray-800 font-semibold mt-2 text-center" style={{ fontFamily: "Z06-Walone-Bold" }}>
                    {contact.name}
                  </Text>
                  <Text className="text-red-500 font-bold text-sm mt-1" style={{ fontFamily: "Z06-Walone-Bold" }}>
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
                <Heading className="text-lg font-bold text-gray-800" style={{ fontFamily: "Z06-Walone-Bold" }}>
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
                <Box className="mb-4">
                  {section.videos.map((video, index) => (
                    <VideoPlayerComponent
                      key={index}
                      video={video}
                      sectionId={section.id}
                      videoStates={videoStates}
                      currentPlayingVideo={currentPlayingVideo}
                      onTogglePlayback={toggleVideoPlayback}
                      onStopVideo={stopVideo}
                    />
                  ))}
                </Box>

                {/* Guidelines */}
                <Text className="text-gray-700 font-semibold mb-3" style={{ fontFamily: "Z06-Walone-Bold" }}
                >
                  {t("safetyGuidelines")}
                </Text>
                <Box className="bg-green-50 p-3 rounded-xl">
                  {section.guidelines.map((guideline, index) => (
                    <Box key={index} className="flex-row items-start mb-2">
                      <Ionicons name="checkmark-circle" size={16} color="#10b981" className="mt-1" />
                      <Text className="text-gray-700 ml-2 flex-1" style={{ fontFamily: "Z06-Walone-Bold" }}>
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
          <Heading className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "Z06-Walone-Bold" }}>
            {t("quickActionTips")}
          </Heading>
          <Box className="flex-row flex-wrap justify-between">
            <Box className="w-[48%] bg-orange-50 p-4 rounded-xl items-center mb-3">
              <Ionicons name="volume-high" size={24} color="#f59e0b" />
              <Text className="text-gray-800 font-semibold mt-2 text-center text-sm" style={{ fontFamily: "Z06-Walone-Bold" }}>
                {t("stayInformed")}
              </Text>
            </Box>
            <Box className="w-[48%] bg-red-50 p-4 rounded-xl items-center mb-3">
              <Ionicons name="walk" size={24} color="#ef4444" />
              <Text className="text-gray-800 font-semibold mt-2 text-center text-sm" style={{ fontFamily: "Z06-Walone-Bold" }}>
                {t("evacuateEarly")}
              </Text>
            </Box>
            <Box className="w-[48%] bg-green-50 p-4 rounded-xl items-center">
              <Ionicons name="battery-charging" size={24} color="#10b981" />
              <Text className="text-gray-800 font-semibold mt-2 text-center text-sm" style={{ fontFamily: "Z06-Walone-Bold" }}>
                {t("chargeDevices")}
              </Text>
            </Box>
            <Box className="w-[48%] bg-blue-50 p-4 rounded-xl items-center">
              <Ionicons name="document-text" size={24} color="#3b82f6" />
              <Text className="text-gray-800 font-semibold mt-2 text-center text-sm" style={{ fontFamily: "Z06-Walone-Bold" }}>
                {t("keepDocumentsSafe")}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Emergency Kit Checklist */}
        <Box className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <Heading className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "Z06-Walone-Bold" }}>
            {t("emergencyKitChecklist")}
          </Heading>
          <Box className="bg-gray-50 p-4 rounded-xl">
            {[
              t("waterOneGallonPersonPerDay"),
              t("nonPerishableFood"),
              t("firstAidKit"),
              t("flashlighWithExtraBatteries"),
              t("portableRadio"),
              t("medicationsSupply"),
              t("personalHygieneItems"),
              t("multiTool"),
              t("emergencyBlankets"),
              t("importantDocumentsCopies"),
              t("cash"),
              t("phoneChargerAndPowerBank")
            ].map((item, index) => (
              <Box key={index} className="flex-row items-center mb-2">
                <Ionicons name="square-outline" size={20} color="#6b7280" />
                <Text className="text-gray-700 ml-3 flex-1" style={{ fontFamily: "Z06-Walone-Bold" }}>
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