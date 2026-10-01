import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Pressable,
} from "react-native";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { endpoints } from "../api/endpoints";
import { useUserProfile, useUpdateUserProfileMutation } from "../hooks/useAppQueries";
import { Button } from "../components/Common";
import { LanguageSwitcherModal } from "../components/LanguageSwitcherModal";
import {
  User as UserIcon,
  Mail,
  Shield,
  KeyRound,
  CheckCircle2,
  Lock,
  LogOut,
  RefreshCw,
  Database,
  WifiOff,
  Globe,
} from "lucide-react-native";

export const ProfileScreen = ({ navigation }: any) => {
  const { user: authUser, updateUserInContext, logout } = useAuth();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const userId = authUser?._id || authUser?.id;

  // React Query cached profile data with offline persistence
  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
    isFetching,
    refetch,
  } = useUserProfile(userId, { enabled: !!userId });

  const activeUser = profileData || authUser;

  // Edit fields
  const [name, setName] = useState(activeUser?.name || "");
  const [email, setEmail] = useState(activeUser?.email || "");
  const updateProfileMutation = useUpdateUserProfileMutation();

  // Password reset fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (activeUser) {
      setName(activeUser.name || "");
      setEmail(activeUser.email || "");
    }
  }, [activeUser?.name, activeUser?.email]);

  const handleUpdateDetails = async () => {
    if (!name.trim() || !email.trim()) {
      showToast("Name and email are required.", "error");
      return;
    }

    if (!userId) {
      showToast("User ID not found. Please log in again.", "error");
      return;
    }

    try {
      const updated = await updateProfileMutation.mutateAsync({
        userId,
        data: {
          name: name.trim(),
          email: email.trim(),
        },
      });

      updateUserInContext({
        name: updated.name || name.trim(),
        email: updated.email || email.trim(),
      });

      showToast("Profile details updated and cached!", "success");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Failed to update profile";
      showToast(msg, "error");
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      showToast("Password must be at least 8 characters long.", "error");
      return;
    }

    if (!newPassword || newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    if (!userId) {
      showToast("User ID not found.", "error");
      return;
    }

    setSavingPassword(true);
    try {
      await endpoints.updateUserPassword(userId, newPassword);
      showToast("Password changed successfully!", "success");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Failed to change password";
      showToast(msg, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    showToast("Signed out successfully", "info");
    navigation.navigate("HomeTab");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => refetch()}
          />
        }
      >
        {/* Profile Header Card */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <UserIcon size={36} color={colors.teal[600]} />
          </View>
          <Text style={styles.userName}>{activeUser?.name || "Staff Member"}</Text>
          <Text style={styles.userEmail}>{activeUser?.email}</Text>

          <View style={styles.roleBadge}>
            <Shield size={12} color={colors.navy[900]} />
            <Text style={styles.roleText}>{activeUser?.role?.toUpperCase() || "STAFF"}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {isProfileError && (
            <View style={styles.offlineBanner}>
              <WifiOff size={16} color={colors.amber[500]} />
              <Text style={styles.offlineBannerText}>
                {t.common.offlineNotice}
              </Text>
            </View>
          )}

          {/* Preferences / Language Section */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Globe size={18} color={colors.teal[600]} />
              <Text style={styles.cardTitle}>App Language / Ururimi</Text>
            </View>

            <View style={styles.langRow}>
              <Text style={styles.langLabel}>{t.common.selectLanguage}</Text>
              <LanguageSwitcherModal />
            </View>
          </View>

          {/* Account Details Form */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <UserIcon size={18} color={colors.teal[600]} />
              <Text style={styles.cardTitle}>Account Information</Text>
            </View>

            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor={colors.text.muted}
              />
            </View>

            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="email@augusmart.rw"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.text.muted}
              />
            </View>

            <View style={{ height: 16 }} />
            <Button
              title="Save Profile Details"
              onPress={handleUpdateDetails}
              loading={updateProfileMutation.isPending}
            />
          </View>

          {/* Security & Password Section */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <KeyRound size={18} color={colors.teal[600]} />
              <Text style={styles.cardTitle}>Change Password</Text>
            </View>

            <Text style={styles.label}>New Password (min 8 characters)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="••••••••"
                secureTextEntry
                placeholderTextColor={colors.text.muted}
              />
            </View>

            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                secureTextEntry
                placeholderTextColor={colors.text.muted}
              />
            </View>

            <View style={{ height: 16 }} />
            <Button
              title="Update Password"
              variant="outline"
              onPress={handleUpdatePassword}
              loading={savingPassword}
            />
          </View>

          {/* Offline Cache & Security Info Banner */}
          <View style={styles.securityNote}>
            <Database size={18} color={colors.teal[600]} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.securityNoteTitle}>Offline Cache Active (persistQueryClient)</Text>
              <Text style={styles.securityNoteDesc}>
                Profile data and service requests are automatically persisted to device storage so you can review account details and service records anytime without internet connectivity.
              </Text>
            </View>
          </View>

          {/* Sign Out Button */}
          <View style={{ marginTop: 8, marginBottom: 40 }}>
            <Button
              title="Sign Out of Account"
              variant="danger"
              onPress={handleSignOut}
              icon={<LogOut size={16} color="#FFFFFF" />}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.navy[900],
    paddingTop: 24,
    paddingBottom: 28,
    alignItems: "center",
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.teal[50],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.teal[500],
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 12,
  },
  userEmail: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.teal[400],
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 10,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.navy[900],
  },
  content: {
    padding: 16,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.amber[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.amber[300],
    marginBottom: 16,
    gap: 8,
  },
  offlineBannerText: {
    fontSize: 12,
    color: colors.navy[900],
    fontWeight: "600",
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy[900],
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  langLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 6,
    marginTop: 8,
  },
  inputContainer: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text.primary,
  },
  securityNote: {
    flexDirection: "row",
    backgroundColor: colors.teal[50],
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.3)",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  securityNoteTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy[900],
  },
  securityNoteDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 3,
    lineHeight: 16,
  },
});
