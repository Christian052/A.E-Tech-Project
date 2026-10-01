import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "../theme/colors";
import { useServices, useTrainingPrograms } from "../hooks/useAppQueries";
import { TECHNICAL_DOCS, TechnicalDoc } from "../data/technicalDocs";
import {
  Search,
  X,
  Wrench,
  GraduationCap,
  FileText,
  ChevronRight,
  BookOpen,
} from "lucide-react-native";

interface GlobalSearchModalProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

type FilterType = "all" | "services" | "training" | "docs";

interface SearchResultItem {
  id: string;
  type: "service" | "training" | "docs";
  title: string;
  subtitle: string;
  category: string;
  rawItem: any;
}

export const GlobalSearchModal = ({
  visible,
  onClose,
  navigation,
}: GlobalSearchModalProps) => {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { data: programs = [], isLoading: programsLoading } = useTrainingPrograms();

  const results = useMemo<SearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    const items: SearchResultItem[] = [];

    // 1. Services
    if (activeFilter === "all" || activeFilter === "services") {
      services.forEach((s) => {
        const titleMatch = s.title?.toLowerCase().includes(q);
        const descMatch =
          s.shortDescription?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q);
        const featureMatch = s.features?.some((f) => f.toLowerCase().includes(q));

        if (!q || titleMatch || descMatch || featureMatch) {
          items.push({
            id: `service-${s._id || s.slug}`,
            type: "service",
            title: s.title,
            subtitle: s.shortDescription || s.description,
            category: "Service Request",
            rawItem: s,
          });
        }
      });
    }

    // 2. Training Programs
    if (activeFilter === "all" || activeFilter === "training") {
      programs.forEach((p) => {
        const titleMatch = p.title?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const currMatch = p.curriculum?.some((c) => c.toLowerCase().includes(q));

        if (!q || titleMatch || descMatch || currMatch) {
          items.push({
            id: `training-${p._id || p.slug}`,
            type: "training",
            title: p.title,
            subtitle: p.description,
            category: `${p.duration || "Course"} · Practical`,
            rawItem: p,
          });
        }
      });
    }

    // 3. Technical Docs
    if (activeFilter === "all" || activeFilter === "docs") {
      TECHNICAL_DOCS.forEach((d) => {
        const titleMatch = d.title.toLowerCase().includes(q);
        const sumMatch = d.summary.toLowerCase().includes(q);
        const kwMatch = d.keywords.some((k) => k.toLowerCase().includes(q));

        if (!q || titleMatch || sumMatch || kwMatch) {
          items.push({
            id: `doc-${d.id}`,
            type: "docs",
            title: d.title,
            subtitle: d.summary,
            category: `${d.category} · ${d.readTime}`,
            rawItem: d,
          });
        }
      });
    }

    return items;
  }, [query, activeFilter, services, programs]);

  const handleSelectItem = (item: SearchResultItem) => {
    onClose();
    if (item.type === "service") {
      navigation.navigate("ServicesTab", {
        screen: "ServiceDetail",
        params: { slug: item.rawItem.slug },
      });
    } else if (item.type === "training") {
      navigation.navigate("TrainingTab", {
        screen: "TrainingApply",
        params: {
          programId: item.rawItem._id,
          programTitle: item.rawItem.title,
        },
      });
    } else if (item.type === "docs") {
      navigation.navigate("TechnicalDocDetail", { doc: item.rawItem });
    }
  };

  const getResultIcon = (type: SearchResultItem["type"]) => {
    switch (type) {
      case "service":
        return <Wrench size={18} color={colors.teal[600]} />;
      case "training":
        return <GraduationCap size={18} color={colors.amber[500]} />;
      case "docs":
        return <BookOpen size={18} color="#6366F1" />;
    }
  };

  const getBadgeStyle = (type: SearchResultItem["type"]) => {
    switch (type) {
      case "service":
        return { backgroundColor: colors.teal[50], color: colors.teal[700] };
      case "training":
        return { backgroundColor: colors.amber[50], color: colors.amber[500] };
      case "docs":
        return { backgroundColor: "#EEF2FF", color: "#4F46E5" };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalContainer}
      >
        {/* Search Header */}
        <View style={styles.header}>
          <View style={styles.searchBar}>
            <Search size={18} color={colors.teal[400]} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search services, courses, technical docs..."
              placeholderTextColor="#94A3B8"
              autoFocus
              clearButtonMode="while-editing"
            />
            {query.length > 0 && Platform.OS !== "ios" && (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <X size={16} color="#94A3B8" />
              </Pressable>
            )}
          </View>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Done</Text>
          </Pressable>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <Pressable
            style={[
              styles.filterPill,
              activeFilter === "all" && styles.filterPillActive,
            ]}
            onPress={() => setActiveFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "all" && styles.filterTextActive,
              ]}
            >
              All ({results.length})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterPill,
              activeFilter === "services" && styles.filterPillActive,
            ]}
            onPress={() => setActiveFilter("services")}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "services" && styles.filterTextActive,
              ]}
            >
              Services
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterPill,
              activeFilter === "training" && styles.filterPillActive,
            ]}
            onPress={() => setActiveFilter("training")}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "training" && styles.filterTextActive,
              ]}
            >
              IT Training
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterPill,
              activeFilter === "docs" && styles.filterPillActive,
            ]}
            onPress={() => setActiveFilter("docs")}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "docs" && styles.filterTextActive,
              ]}
            >
              Technical Docs
            </Text>
          </Pressable>
        </View>

        {/* Results List */}
        {servicesLoading || programsLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.teal[600]} />
            <Text style={styles.loadingText}>Searching AUGU Smart catalog...</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No matching items found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for keywords like "cctv", "motherboard", "printer", "cabling", or "internship".
            </Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const badgeStyle = getBadgeStyle(item.type);
              return (
                <Pressable
                  style={styles.resultCard}
                  onPress={() => handleSelectItem(item)}
                >
                  <View style={styles.iconContainer}>{getResultIcon(item.type)}</View>

                  <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: badgeStyle.backgroundColor },
                        ]}
                      >
                        <Text
                          style={[styles.badgeText, { color: badgeStyle.color }]}
                        >
                          {item.type === "service"
                            ? "Service"
                            : item.type === "training"
                            ? "Training"
                            : "Doc"}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.itemSubtitle} numberOfLines={2}>
                      {item.subtitle}
                    </Text>

                    <Text style={styles.itemCategory}>{item.category}</Text>
                  </View>

                  <ChevronRight size={18} color={colors.text.muted} />
                </Pressable>
              );
            }}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.navy[900],
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 16 : 20,
    paddingBottom: 14,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 14,
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  closeBtnText: {
    color: colors.teal[400],
    fontSize: 14,
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.navy[900],
    borderColor: colors.navy[900],
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  loadingBox: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: colors.text.secondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy[900],
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.teal[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  itemTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy[900],
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 3,
    lineHeight: 16,
  },
  itemCategory: {
    fontSize: 11,
    color: colors.teal[700],
    fontWeight: "600",
    marginTop: 4,
  },
});
