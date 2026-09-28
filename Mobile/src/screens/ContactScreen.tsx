import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "../theme/colors";
import { endpoints } from "../api/endpoints";
import { Button } from "../components/Common";
import { useToast } from "../context/ToastContext";
import { Phone, MessageSquare, MapPin, Mail, Clock } from "lucide-react-native";

export const ContactScreen = ({ route }: any) => {
  const preselectedService = route?.params?.preselectedService || "";
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceInterest, setServiceInterest] = useState(preselectedService);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !message.trim()) {
      showToast("Please enter your name, phone number, and message.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await endpoints.submitContact({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        serviceInterest: serviceInterest.trim(),
        message: message.trim(),
      });

      showToast("Inquiry submitted! Our technical team will reach out promptly.", "success");
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to submit inquiry. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    Linking.openURL("https://wa.me/250788111222?text=Hello%20AUGU%20SMART,%20I%20have%20an%20inquiry.");
  };

  const callPhone = () => {
    Linking.openURL("tel:+250788111222");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Contact & Service Booking</Text>
          <Text style={styles.subtitle}>
            Have an urgent IT issue, printer repair, or CCTV consultation? Get in touch with our certified engineers.
          </Text>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.contactRow}>
          <Pressable style={styles.contactBox} onPress={callPhone}>
            <Phone size={20} color={colors.teal[600]} />
            <Text style={styles.contactBoxTitle}>Call Us</Text>
            <Text style={styles.contactBoxSubtitle}>+250 788 111 222</Text>
          </Pressable>

          <Pressable style={styles.contactBox} onPress={openWhatsApp}>
            <MessageSquare size={20} color={colors.teal[600]} />
            <Text style={styles.contactBoxTitle}>WhatsApp</Text>
            <Text style={styles.contactBoxSubtitle}>Fast Reply</Text>
          </Pressable>
        </View>

        {/* Form Container */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Send an Inquiry or Quote Request</Text>

          <Text style={styles.label}>Your Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Eric Ndahiro"
            placeholderTextColor={colors.text.muted}
          />

          <Text style={styles.label}>Phone Number (WhatsApp preferred) *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+250 788 000 000"
            keyboardType="phone-pad"
            placeholderTextColor={colors.text.muted}
          />

          <Text style={styles.label}>Email Address (Optional)</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="eric@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.text.muted}
          />

          <Text style={styles.label}>Service Needed</Text>
          <TextInput
            style={styles.input}
            value={serviceInterest}
            onChangeText={setServiceInterest}
            placeholder="e.g. CCTV Installation, Laptop Repair, etc."
            placeholderTextColor={colors.text.muted}
          />

          <Text style={styles.label}>Describe Issue / Requirements *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Describe the device problem, location, or equipment specifications..."
            multiline
            numberOfLines={4}
            placeholderTextColor={colors.text.muted}
          />

          <View style={{ height: 16 }} />
          <Button
            title="Submit Request"
            onPress={handleSubmit}
            loading={submitting}
          />
        </View>

        {/* Workshop Location & Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Workshop Location</Text>
          <View style={styles.infoRow}>
            <MapPin size={18} color={colors.teal[600]} />
            <Text style={styles.infoText}>Kigali, Rwanda (Near City Commercial Center)</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={18} color={colors.teal[600]} />
            <Text style={styles.infoText}>Monday – Saturday: 8:00 AM – 7:00 PM</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
  subtitle: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 6,
    lineHeight: 18,
  },
  contactRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginTop: -16,
  },
  contactBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  contactBoxTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: 6,
  },
  contactBoxSubtitle: {
    fontSize: 11,
    color: colors.teal[600],
    marginTop: 2,
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.navy[900],
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text.primary,
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy[900],
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
  },
});
