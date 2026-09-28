import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "../theme/colors";
import { endpoints } from "../api/endpoints";
import { Button } from "../components/Common";
import { useToast } from "../context/ToastContext";

export const TrainingApplyScreen = ({ route, navigation }: any) => {
  const { programId, programTitle } = route.params || {};
  const { showToast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [motivation, setMotivation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim() || !phone.trim()) {
      showToast("Please provide your full name and phone number.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await endpoints.submitApplication({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        programId: programId || "",
        educationLevel: educationLevel.trim(),
        motivation: motivation.trim(),
      });

      showToast("Application submitted successfully! Our admissions team will call you.", "success");
      navigation.goBack();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to submit application. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Apply for Admission</Text>
          <Text style={styles.programName}>{programTitle || "IT Vocational Program"}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Jean Paul Habimana"
            placeholderTextColor={colors.text.muted}
          />

          <Text style={styles.label}>Phone Number (WhatsApp preferred) *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+250 788 123 456"
            keyboardType="phone-pad"
            placeholderTextColor={colors.text.muted}
          />

          <Text style={styles.label}>Email Address (Optional)</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="jeanpaul@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.text.muted}
          />

          <Text style={styles.label}>Highest Level of Education</Text>
          <TextInput
            style={styles.input}
            value={educationLevel}
            onChangeText={setEducationLevel}
            placeholder="e.g. High School (TSS / WDA), University, etc."
            placeholderTextColor={colors.text.muted}
          />

          <Text style={styles.label}>Why are you interested in this program?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={motivation}
            onChangeText={setMotivation}
            placeholder="Tell us about your learning goals and schedule availability..."
            multiline
            numberOfLines={4}
            placeholderTextColor={colors.text.muted}
          />

          <View style={{ height: 12 }} />
          <Button
            title="Submit Application"
            onPress={handleSubmit}
            loading={submitting}
          />
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
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  programName: {
    fontSize: 14,
    color: colors.teal[400],
    marginTop: 4,
    fontWeight: "600",
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
});
