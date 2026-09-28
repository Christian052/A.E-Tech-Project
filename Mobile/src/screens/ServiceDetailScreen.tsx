import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import { colors } from "../theme/colors";
import { endpoints } from "../api/endpoints";
import { Service } from "../types";
import { Button } from "../components/Common";
import { CheckCircle2, ShieldCheck, Phone, MessageSquare } from "lucide-react-native";

export const ServiceDetailScreen = ({ route, navigation }: any) => {
  const { slug } = route.params;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await endpoints.getServiceBySlug(slug);
        setService(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal[600]} />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Service not found.</Text>
      </View>
    );
  }

  const openWhatsApp = () => {
    Linking.openURL(
      `https://wa.me/250788111222?text=Hello%20AUGU%20SMART,%20I%20need%20assistance%20with%20${encodeURIComponent(service.title)}.`
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{service.title}</Text>
        {service.pricingInfo ? (
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{service.pricingInfo}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.description}>{service.description || service.shortDescription}</Text>

        {service.features && service.features.length > 0 && (
          <View style={styles.featuresBox}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            {service.features.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <CheckCircle2 size={16} color={colors.teal[600]} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.guaranteeBox}>
          <ShieldCheck size={24} color={colors.teal[600]} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.guaranteeTitle}>Warranty & Quality Guaranteed</Text>
            <Text style={styles.guaranteeDesc}>
              All diagnostic and repair procedures use genuine replacement parts with complete post-repair testing and support.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Book This Service"
            onPress={() => navigation.navigate("ContactTab", { preselectedService: service.title })}
          />
          <View style={{ height: 10 }} />
          <Button
            title="Inquire via WhatsApp"
            variant="outline"
            onPress={openWhatsApp}
            icon={<MessageSquare size={16} color={colors.teal[600]} />}
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
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundText: {
    color: colors.text.secondary,
    fontSize: 15,
  },
  header: {
    backgroundColor: colors.navy[900],
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 28,
  },
  priceBadge: {
    backgroundColor: colors.teal[600],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  priceText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  body: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.navy[900],
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  featuresBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 13,
    color: colors.text.primary,
    flex: 1,
  },
  guaranteeBox: {
    flexDirection: "row",
    backgroundColor: colors.teal[50],
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.3)",
    alignItems: "center",
    marginBottom: 24,
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy[900],
  },
  guaranteeDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  actions: {
    marginTop: 8,
    marginBottom: 32,
  },
});
