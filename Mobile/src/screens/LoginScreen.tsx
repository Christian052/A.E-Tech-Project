import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/Common";
import { ShieldCheck, Lock, Mail } from "lucide-react-native";

export const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showToast("Please enter your email and password.", "error");
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      showToast("Signed in successfully.", "success");
      navigation.navigate("AdminDashboard");
    } else {
      showToast(res.message || "Invalid credentials", "error");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <ShieldCheck size={36} color={colors.teal[600]} />
        </View>
        <Text style={styles.title}>Staff / Admin Portal</Text>
        <Text style={styles.subtitle}>
          Sign in with your AUGU SMART staff credentials to manage inquiries, applications, and workshop requests.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputRow}>
            <Mail size={18} color={colors.text.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="admin@augusmart.rw"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.text.muted}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <Lock size={18} color={colors.text.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              placeholderTextColor={colors.text.muted}
            />
          </View>

          <View style={{ height: 16 }} />
          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy[900],
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.teal[50],
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.navy[900],
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 20,
  },
  form: {
    marginTop: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 6,
    marginTop: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text.primary,
  },
});
