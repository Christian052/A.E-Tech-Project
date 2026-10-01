import React from "react";
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
import { useServices } from "../hooks/useAppQueries";
import { useLanguage } from "../context/LanguageContext";
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
  WifiOff,
} from "lucide-react-native";

export const ServicesScreen = ({ navigation }: any) => {
  const { t } = useLanguage();
  const { data: services = [], isLoading, isError, isFetching, refetch } = useServices();

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

  // Only show full loading spinner if we don't even have cached data
  if (isLoading && services.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal[600]} />
        <Text style={styles.loadingText}>{t.services.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && services.length > 0}
            onRefresh={() => refetch()}
          />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerBox}>
            {isError && (
              <View style={styles.offlineNotice}>
                <WifiOff size={16} color={colors.amber[500]} />
                <Text style={styles.offlineNoticeText}>
                  {t.services.offlineMode}
                </Text>
              </View>
            )}
            <Text style={styles.headerTitle}>{t.services.title}</Text>
            <Text style={styles.headerSubtitle}>
              {t.services.subtitle}
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
  offlineNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.amber[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.amber[300],
    marginBottom: 12,
    gap: 8,
  },
  offlineNoticeText: {
    fontSize: 12,
    color: colors.navy[900],
    fontWeight: "600",
    flex: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.teal[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  cardDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 3,
    lineHeight: 16,
  },
  cardPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.teal[600],
    marginTop: 6,
  },
});
