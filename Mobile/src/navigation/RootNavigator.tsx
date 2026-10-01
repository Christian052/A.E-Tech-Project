import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

// Screens
import { HomeScreen } from "../screens/HomeScreen";
import { ServicesScreen } from "../screens/ServicesScreen";
import { ServiceDetailScreen } from "../screens/ServiceDetailScreen";
import { TrainingScreen } from "../screens/TrainingScreen";
import { TrainingApplyScreen } from "../screens/TrainingApplyScreen";
import { GalleryScreen } from "../screens/GalleryScreen";
import { ContactScreen } from "../screens/ContactScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { AdminDashboardScreen } from "../screens/AdminDashboardScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { TechnicalDocDetailScreen } from "../screens/TechnicalDocDetailScreen";

// Global Search & Language Modals
import { GlobalSearchModal } from "../components/GlobalSearchModal";
import { LanguageSwitcherModal } from "../components/LanguageSwitcherModal";

// Icons
import {
  Home,
  Wrench,
  GraduationCap,
  Image as ImageIcon,
  Phone,
  ShieldCheck,
  User as UserIcon,
  Search,
} from "lucide-react-native";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Services Stack
const ServicesStack = ({ onOpenSearch }: { onOpenSearch: () => void }) => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.navy[900] },
      headerTintColor: "#FFFFFF",
      headerTitleStyle: { fontWeight: "700" },
    }}
  >
    <Stack.Screen
      name="ServicesList"
      component={ServicesScreen}
      options={{
        title: "Services",
        headerRight: () => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginRight: 16 }}>
            <LanguageSwitcherModal />
            <Pressable onPress={onOpenSearch} hitSlop={8}>
              <Search size={20} color={colors.teal[400]} />
            </Pressable>
          </View>
        ),
      }}
    />
    <Stack.Screen
      name="ServiceDetail"
      component={ServiceDetailScreen}
      options={{ title: "Service Details" }}
    />
  </Stack.Navigator>
);

// Training Stack
const TrainingStack = ({ onOpenSearch }: { onOpenSearch: () => void }) => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.navy[900] },
      headerTintColor: "#FFFFFF",
      headerTitleStyle: { fontWeight: "700" },
    }}
  >
    <Stack.Screen
      name="TrainingList"
      component={TrainingScreen}
      options={{
        title: "Training Programs",
        headerRight: () => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginRight: 16 }}>
            <LanguageSwitcherModal />
            <Pressable onPress={onOpenSearch} hitSlop={8}>
              <Search size={20} color={colors.teal[400]} />
            </Pressable>
          </View>
        ),
      }}
    />
    <Stack.Screen
      name="TrainingApply"
      component={TrainingApplyScreen}
      options={{ title: "Apply for Training" }}
    />
  </Stack.Navigator>
);

// Main Bottom Tab Navigator
export const RootNavigator = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [searchVisible, setSearchVisible] = useState(false);
  const navigationRef = React.useRef<any>(null);

  const openSearch = () => setSearchVisible(true);
  const closeSearch = () => setSearchVisible(false);

  return (
    <NavigationContainer ref={navigationRef}>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.navy[900] },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "700" },
          tabBarActiveTintColor: colors.teal[500],
          tabBarInactiveTintColor: "#94A3B8",
          tabBarStyle: {
            backgroundColor: colors.navy[900],
            borderTopColor: "rgba(255, 255, 255, 0.1)",
            paddingBottom: 6,
            paddingTop: 6,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: t.tabs.home,
            headerTitle: "AUGU SMART ELECTRONIC",
            headerRight: () => (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginRight: 16 }}>
                <LanguageSwitcherModal />
                <Pressable onPress={openSearch} hitSlop={8}>
                  <Search size={20} color={colors.teal[400]} />
                </Pressable>
                <Pressable
                  onPress={() =>
                    navigation.navigate(isAuthenticated ? "AdminDashboard" : "Login")
                  }
                  hitSlop={8}
                >
                  <ShieldCheck
                    size={22}
                    color={isAuthenticated ? colors.teal[400] : "#FFFFFF"}
                  />
                </Pressable>
              </View>
            ),
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          })}
        />

        <Tab.Screen
          name="ServicesTab"
          options={{
            headerShown: false,
            title: t.tabs.services,
            tabBarIcon: ({ color, size }) => <Wrench size={size} color={color} />,
          }}
        >
          {() => <ServicesStack onOpenSearch={openSearch} />}
        </Tab.Screen>

        <Tab.Screen
          name="TrainingTab"
          options={{
            headerShown: false,
            title: t.tabs.training,
            tabBarIcon: ({ color, size }) => (
              <GraduationCap size={size} color={color} />
            ),
          }}
        >
          {() => <TrainingStack onOpenSearch={openSearch} />}
        </Tab.Screen>

        <Tab.Screen
          name="GalleryTab"
          component={GalleryScreen}
          options={{
            title: t.tabs.gallery,
            headerTitle: "Workshop Projects",
            headerRight: () => (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginRight: 16 }}>
                <LanguageSwitcherModal />
                <Pressable onPress={openSearch} hitSlop={8}>
                  <Search size={20} color={colors.teal[400]} />
                </Pressable>
              </View>
            ),
            tabBarIcon: ({ color, size }) => (
              <ImageIcon size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="ContactTab"
          component={ContactScreen}
          options={{
            title: t.tabs.contact,
            headerTitle: t.contact.title,
            headerRight: () => (
              <View style={{ marginRight: 16 }}>
                <LanguageSwitcherModal />
              </View>
            ),
            tabBarIcon: ({ color, size }) => <Phone size={size} color={color} />,
          }}
        />

        {/* Hidden from tab bar directly, accessible via navigation */}
        <Tab.Screen
          name="Login"
          component={LoginScreen}
          options={{
            tabBarButton: () => null,
            title: "Staff Login",
          }}
        />

        <Tab.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={({ navigation }) => ({
            tabBarButton: () => null,
            title: "Staff Dashboard",
            headerRight: () => (
              <Pressable
                onPress={() => navigation.navigate("Profile")}
                style={{ marginRight: 16 }}
              >
                <UserIcon size={20} color={colors.teal[400]} />
              </Pressable>
            ),
          })}
        />

        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarButton: () => null,
            title: "My Profile",
            headerTitle: "Account & Profile",
          }}
        />

        {/* Technical Documentation Viewer Screen */}
        <Tab.Screen
          name="TechnicalDocDetail"
          component={TechnicalDocDetailScreen}
          options={{
            tabBarButton: () => null,
            title: "Technical Document",
            headerTitle: "Hardware Knowledge Base",
          }}
        />
      </Tab.Navigator>

      {/* Global Search Modal for Mobile App */}
      <GlobalSearchModal
        visible={searchVisible}
        onClose={closeSearch}
        navigation={navigationRef.current}
      />
    </NavigationContainer>
  );
};
