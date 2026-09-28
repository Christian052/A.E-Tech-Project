import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { colors } from "../theme/colors";
import { endpoints } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Common";
import {
  FileText,
  GraduationCap,
  Wrench,
  Users,
  LogOut,
  User as UserIcon,
  ChevronRight,
  ShieldCheck,
} from "lucide-react-native";

export const AdminDashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await endpoints.getAdminStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.navigate("HomeTab");
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal[600]} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchStats();
          }}
        />
      }
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || "Administrator"}</Text>
          <Text style={styles.userRole}>Role: {user?.role || "Staff"}</Text>
        </View>

        <Pressable
          style={styles.profileBadgeBtn}
          onPress={() => navigation.navigate("Profile")}
        >
          <UserIcon size={20} color={colors.teal[400]} />
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Quick Profile Nav Banner */}
        <Pressable
          style={styles.profileBanner}
          onPress={() => navigation.navigate("Profile")}
        >
          <View style={styles.profileBannerIcon}>
            <UserIcon size={22} color={colors.teal[600]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileBannerTitle}>My User Profile</Text>
            <Text style={styles.profileBannerDesc}>
              Update your account details and password via /api/users
            </Text>
          </View>
          <ChevronRight size={20} color={colors.text.muted} />
        </Pressable>

        <Text style={styles.sectionTitle}>Overview & Key Metrics</Text>
        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <FileText size={24} color={colors.teal[600]} />
            <Text style={styles.metricValue}>{stats?.inquiriesCount || 0}</Text>
            <Text style={styles.metricLabel}>Contact Inquiries</Text>
          </View>

          <View style={styles.metricCard}>
            <GraduationCap size={24} color={colors.amber[500]} />
            <Text style={styles.metricValue}>{stats?.applicationsCount || 0}</Text>
            <Text style={styles.metricLabel}>Training Applications</Text>
          </View>

          <View style={styles.metricCard}>
            <Wrench size={24} color={colors.navy[700]} />
            <Text style={styles.metricValue}>{stats?.servicesCount || 0}</Text>
            <Text style={styles.metricLabel}>Active Services</Text>
          </View>

          <View style={styles.metricCard}>
            <Users size={24} color={colors.success} />
            <Text style={styles.metricValue}>{stats?.usersCount || 0}</Text>
            <Text style={styles.metricLabel}>Staff Members</Text>
          </View>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Direct API Sync</Text>
          <Text style={styles.noteDesc}>
            This mobile application is connected directly to your existing MongoDB database and Express backend. All inquiries and trainee admissions sync in real-time between the web portal and mobile app.
          </Text>
        </View>

        <View style={{ marginTop: 24, marginBottom: 32 }}>
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleLogout}
            icon={<LogOut size={16} color={colors.teal[600]} />}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: colors.navy[900],
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcome: {
    fontSize: 12,
    color: "#94A3B8",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    color: colors.teal[400],
    marginTop: 2,
    fontWeight: "600",
  },
  profileBadgeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  content: {
    padding: 20,
  },
  profileBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  profileBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.teal[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  profileBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy[900],
  },
  profileBannerDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.navy[900],
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.navy[900],
    marginTop: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    fontWeight: "600",
  },
  noteBox: {
    marginTop: 24,
    backgroundColor: colors.teal[50],
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.3)",
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy[900],
    marginBottom: 4,
  },
  noteDesc: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
