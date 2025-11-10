// NativeWind setup - must be imported first
import { cssInterop } from "nativewind";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
} from "react-native";

// Enable NativeWind className support for React Native components
// This must be done before any components are imported/used
cssInterop(View, { className: "style" });
cssInterop(Text, { className: "style" });
cssInterop(Pressable, { className: "style" });
cssInterop(ScrollView, { className: "style" });
cssInterop(SafeAreaView, { className: "style" });
cssInterop(Image, { className: "style" });
cssInterop(TextInput, { className: "style" });
cssInterop(TouchableOpacity, { className: "style" });
cssInterop(TouchableHighlight, { className: "style" });
cssInterop(TouchableWithoutFeedback, { className: "style" });

