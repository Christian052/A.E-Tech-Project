import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { colors } from "../theme/colors";
import { endpoints } from "../api/endpoints";
import { Service } from "../types";
import {
  Wrench,
  ChevronRight,
  ShieldAlert,
  Cpu,
  Printer,
  Camera,
  Network,
  Laptop,
} from "lucide-react-native";

export const ServicesScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

  const fetchServices = async () => {
    try {
      const data = await endpoints.getServices();
      setServices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const getServiceIcon = (slug: string) => {
    if (slug.includes("printer") || slug.includes("photocopier")) {
      return <Printer size={24} color={colors.teal[600]} />;
    }
    if (slug.includes("cctv") || slug.includes("security")) {
      return <Camera size={24} color={colors.teal[600]} />;
    }
    if (slug.includes("network")) {
      return <Network size={24} color={colors.teal[600]} />;
    }
    if (slug.includes("computer") || slug.includes("laptop")) {
      return <Laptop size={24} color={colors.teal[600]} />;
    }
    if (slug.includes("chip") || slug.includes("electronic")) {
      return <Cpu size={24} color={colors.teal[600]} />;
    }
    return <Wrench size={24} color={colors.teal[600]} />;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal[600]} />
        <Text style={styles.loadingText}>Loading IT & Repair Services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchServices(); }} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerBox}>
            <Text style={styles.headerTitle}>Professional Tech Services</Text>
            <Text style={styles.headerSubtitle}>
              From micro-soldering and motherboard diagnostics to enterprise CCTV and optical networks across Kigali.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("ServiceDetail", { slug: item.slug })}
          >
            <View style={styles.iconBox}>{getServiceIcon(item.slug)}</View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.shortDescription || item.description}
              </Text>
              {item.pricingInfo ? (
                <Text style={styles.cardPrice}>{item.pricingInfo}</Text>
              ) : null}
            </View>
            <ChevronRight size={20} color={colors.text.muted} />
          </Pressable>
        )}
      />
    </View>
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
  loadingText: {
    marginTop: 12,
    color: colors.text.secondary,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerBox: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.navy[900],
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.teal[50],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
    lineHeight: 18,
  },
  cardPrice: {
    fontSize: 12,
    color: colors.teal[600],
    fontWeight: "700",
    marginTop: 6,
  },
});
