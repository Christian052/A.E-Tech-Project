import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";

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

// Icons
import {
  Home,
  Wrench,
  GraduationCap,
  Image as ImageIcon,
  Phone,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react-native";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Services Stack
const ServicesStack = () => (
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
      options={{ title: "Services" }}
    />
    <Stack.Screen
      name="ServiceDetail"
      component={ServiceDetailScreen}
      options={{ title: "Service Details" }}
    />
  </Stack.Navigator>
);

// Training Stack
const TrainingStack = () => (
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
      options={{ title: "Training Programs" }}
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

  return (
    <NavigationContainer>
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
            title: "Home",
            headerTitle: "AUGU SMART ELECTRONIC",
            headerRight: () => (
              <Pressable
                onPress={() =>
                  navigation.navigate(isAuthenticated ? "AdminDashboard" : "Login")
                }
                style={{ marginRight: 16 }}
              >
                <ShieldCheck
                  size={22}
                  color={isAuthenticated ? colors.teal[400] : "#FFFFFF"}
                />
              </Pressable>
            ),
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          })}
        />

        <Tab.Screen
          name="ServicesTab"
          component={ServicesStack}
          options={{
            headerShown: false,
            title: "Services",
            tabBarIcon: ({ color, size }) => <Wrench size={size} color={color} />,
          }}
        />

        <Tab.Screen
          name="TrainingTab"
          component={TrainingStack}
          options={{
            headerShown: false,
            title: "Training",
            tabBarIcon: ({ color, size }) => (
              <GraduationCap size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="GalleryTab"
          component={GalleryScreen}
          options={{
            title: "Gallery",
            headerTitle: "Workshop Projects",
            tabBarIcon: ({ color, size }) => (
              <ImageIcon size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="ContactTab"
          component={ContactScreen}
          options={{
            title: "Contact",
            headerTitle: "Get in Touch",
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
      </Tab.Navigator>
    </NavigationContainer>
  );
};
