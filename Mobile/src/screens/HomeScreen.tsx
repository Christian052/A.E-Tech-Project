import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { colors } from "../theme/colors";
import { endpoints } from "../api/endpoints";
import { Service, TrainingProgram, SiteSettings } from "../types";
import { Button } from "../components/Common";
import {
  Wrench,
  GraduationCap,
  Phone,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
} from "lucide-react-native";

export const HomeScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);

  const fetchData = async () => {
    try {
      const [settRes, servRes, progRes] = await Promise.allSettled([
        endpoints.getSettings(),
        endpoints.getServices(),
        endpoints.getTrainingPrograms(),
      ]);

      if (settRes.status === "fulfilled") setSettings(settRes.value);
      if (servRes.status === "fulfilled") setServices(servRes.value.slice(0, 4));
      if (progRes.status === "fulfilled") setPrograms(progRes.value.slice(0, 3));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const openWhatsApp = () => {
    const rawNumber = settings?.whatsapp || settings?.phone || "+250788111222";
    const cleaned = rawNumber.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/${cleaned}?text=Hello%20AUGU%20SMART,%20I%20would%20like%20to%20inquire%20about%20your%20services.`);
  };

  const callPhone = () => {
    const rawNumber = settings?.phone || "+250788111222";
    Linking.openURL(`tel:${rawNumber.replace(/\s+/g, "")}`);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal[600]} />
        <Text style={styles.loadingText}>Loading AUGU Smart Electronic...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Hero Banner */}
      <View style={styles.heroSection}>
        <View style={styles.badgeContainer}>
          <ShieldCheck size={14} color={colors.teal[400]} />
          <Text style={styles.badgeText}>Kigali's Premier IT & Electronics Center</Text>
        </View>
        <Text style={styles.heroTitle}>AUGU SMART ELECTRONIC SERVICE</Text>
        <Text style={styles.heroSubtitle}>
          Professional Computer & Printer Repair, CCTV Installation, Networking, and Certified IT Training & Internships in Rwanda.
        </Text>

        <View style={styles.heroActionRow}>
          <Pressable style={styles.actionButtonPrimary} onPress={() => navigation.navigate("ContactTab")}>
            <Text style={styles.actionButtonPrimaryText}>Request Service</Text>
          </Pressable>
          <Pressable style={styles.actionButtonSecondary} onPress={openWhatsApp}>
            <MessageSquare size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonSecondaryText}>WhatsApp</Text>
          </Pressable>
        </View>
      </View>

      {/* Quick Contact Info Strip */}
      <View style={styles.contactStrip}>
        <Pressable style={styles.stripItem} onPress={callPhone}>
          <Phone size={16} color={colors.teal[600]} />
          <Text style={styles.stripText}>{settings?.phone || "+250 788 111 222"}</Text>
        </Pressable>
        <View style={styles.stripDivider} />
        <View style={styles.stripItem}>
          <MapPin size={16} color={colors.teal[600]} />
          <Text style={styles.stripText} numberOfLines={1}>
            {settings?.address || "Kigali, Rwanda"}
          </Text>
        </View>
      </View>

      {/* Featured Services Section */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Our Core Services</Text>
          <Text style={styles.sectionSubtitle}>Diagnostic, repair, and security solutions</Text>
        </View>
        <Pressable
          style={styles.seeAllButton}
          onPress={() => navigation.navigate("ServicesTab")}
        >
          <Text style={styles.seeAllText}>View All</Text>
          <ChevronRight size={16} color={colors.teal[600]} />
        </Pressable>
      </View>

      <View style={styles.cardList}>
        {services.length === 0 ? (
          <Text style={styles.emptyText}>Services currently updating.</Text>
        ) : (
          services.map((item) => (
            <Pressable
              key={item._id}
              style={styles.serviceCard}
              onPress={() => navigation.navigate("ServicesTab", { screen: "ServiceDetail", params: { slug: item.slug } })}
            >
              <View style={styles.serviceIconWrapper}>
                <Wrench size={22} color={colors.teal[600]} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle}>{item.title}</Text>
                <Text style={styles.serviceDescription} numberOfLines={2}>
                  {item.shortDescription || item.description}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.text.muted} />
            </Pressable>
          ))
        )}
      </View>

      {/* Training & Internship Preview */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>IT Training & Internship</Text>
          <Text style={styles.sectionSubtitle}>Practical hardware and networking skills</Text>
        </View>
        <Pressable
          style={styles.seeAllButton}
          onPress={() => navigation.navigate("TrainingTab")}
        >
          <Text style={styles.seeAllText}>Explore</Text>
          <ChevronRight size={16} color={colors.teal[600]} />
        </Pressable>
      </View>

      <View style={styles.cardList}>
        {programs.map((program) => (
          <View key={program._id} style={styles.programCard}>
            <View style={styles.programHeader}>
              <View style={styles.programBadge}>
                <GraduationCap size={16} color={colors.teal[600]} />
                <Text style={styles.programDuration}>{program.duration || "3 Months"}</Text>
              </View>
              {program.internshipIncluded && (
                <View style={styles.internshipBadge}>
                  <CheckCircle2 size={12} color={colors.navy[900]} />
                  <Text style={styles.internshipBadgeText}>Internship Guaranteed</Text>
                </View>
              )}
            </View>
            <Text style={styles.programTitle}>{program.title}</Text>
            <Text style={styles.programDescription} numberOfLines={2}>
              {program.description}
            </Text>
            <Button
              title="Apply Now"
              variant="outline"
              onPress={() => navigation.navigate("TrainingTab", { screen: "TrainingApply", params: { programId: program._id, programTitle: program.title } })}
            />
          </View>
        ))}
      </View>

      {/* Why Choose Us */}
      <View style={styles.whyUsBox}>
        <Text style={styles.whyUsTitle}>Why Choose AUGU SMART?</Text>
        <View style={styles.whyRow}>
          <CheckCircle2 size={18} color={colors.teal[500]} />
          <Text style={styles.whyText}>Certified Technicians with 10+ Years Experience</Text>
        </View>
        <View style={styles.whyRow}>
          <CheckCircle2 size={18} color={colors.teal[500]} />
          <Text style={styles.whyText}>Genuine Parts & Clear Warranty on All Repairs</Text>
        </View>
        <View style={styles.whyRow}>
          <CheckCircle2 size={18} color={colors.teal[500]} />
          <Text style={styles.whyText}>Hands-on practical training with guaranteed internship</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
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
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: colors.text.secondary,
    fontSize: 14,
  },
  heroSection: {
    backgroundColor: colors.navy[900],
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20, 184, 166, 0.15)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.3)",
  },
  badgeText: {
    color: colors.teal[400],
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 8,
    lineHeight: 20,
  },
  heroActionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  actionButtonPrimary: {
    flex: 1,
    backgroundColor: colors.teal[600],
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  actionButtonSecondaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  contactStrip: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  stripItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stripDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },
  stripText: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.navy[900],
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 13,
    color: colors.teal[600],
    fontWeight: "600",
  },
  cardList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    color: colors.text.muted,
    marginVertical: 16,
  },
  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  serviceIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.teal[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  serviceDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 3,
  },
  programCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  programHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  programBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  programDuration: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "600",
  },
  internshipBadge: {
    backgroundColor: colors.amber[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.amber[400],
  },
  internshipBadgeText: {
    fontSize: 10,
    color: colors.navy[900],
    fontWeight: "700",
  },
  programTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 6,
  },
  programDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  whyUsBox: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: colors.navy[900],
    borderRadius: 12,
    padding: 20,
  },
  whyUsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 14,
  },
  whyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  whyText: {
    color: "#E2E8F0",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
