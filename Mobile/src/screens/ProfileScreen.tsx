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
import { endpoints } from "../api/endpoints";
import { Button } from "../components/Common";
import {
  User as UserIcon,
  Mail,
  Shield,
  KeyRound,
  CheckCircle2,
  Lock,
  LogOut,
  RefreshCw,
} from "lucide-react-native";

export const ProfileScreen = ({ navigation }: any) => {
  const { user, updateUserInContext, refreshUserProfile, logout } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Edit fields
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password reset fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const userId = user?._id || user?.id;

  const loadProfile = async () => {
    try {
      setLoading(true);
      await refreshUserProfile();
    } catch (e: any) {
      showToast("Failed to refresh user profile.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateDetails = async () => {
    if (!name.trim() || !email.trim()) {
      showToast("Name and email are required.", "error");
      return;
    }

    if (!userId) {
      showToast("User ID not found. Please log in again.", "error");
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await endpoints.updateUserProfile(userId, {
        name: name.trim(),
        email: email.trim(),
      });

      updateUserInContext({
        name: updated.name || name.trim(),
        email: updated.email || email.trim(),
      });

      showToast("Profile details updated successfully!", "success");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Failed to update profile";
      showToast(msg, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      showToast("Password must be at least 8 characters long.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
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
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadProfile();
            }}
          />
        }
      >
        {/* Profile Header Card */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <UserIcon size={36} color={colors.teal[600]} />
          </View>
          <Text style={styles.userName}>{user?.name || "Staff Member"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.roleBadge}>
            <Shield size={12} color={colors.navy[900]} />
            <Text style={styles.roleText}>{user?.role?.toUpperCase() || "STAFF"}</Text>
          </View>
        </View>

        <View style={styles.content}>
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
              loading={savingProfile}
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

          {/* Secure Storage Info Banner */}
          <View style={styles.securityNote}>
            <CheckCircle2 size={18} color={colors.teal[600]} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.securityNoteTitle}>Expo SecureStore Protected</Text>
              <Text style={styles.securityNoteDesc}>
                Your JWT access and refresh tokens are encrypted in hardware-backed secure storage (iOS Keychain / Android Keystore) across device restarts.
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
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  userEmail: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.amber[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 10,
    gap: 5,
    borderWidth: 1,
    borderColor: colors.amber[400],
  },
  roleText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.navy[900],
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy[900],
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 6,
    marginTop: 10,
  },
  inputContainer: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    paddingVertical: 12,
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
    alignItems: "center",
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
    marginTop: 2,
    lineHeight: 16,
  },
});
