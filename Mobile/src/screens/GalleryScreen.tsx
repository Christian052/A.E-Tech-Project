import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from "react-native";
import { colors } from "../theme/colors";
import { endpoints } from "../api/endpoints";
import { GalleryItem } from "../types";

const CATEGORIES = [
  { id: "all", label: "All Projects" },
  { id: "cctv", label: "CCTV Installation" },
  { id: "computer", label: "Computer Repair" },
  { id: "printer", label: "Printer & Copier" },
  { id: "networking", label: "Networking" },
  { id: "training", label: "Training Workshop" },
];

export const GalleryScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");

  const fetchGallery = async (category = activeCategory) => {
    try {
      const data = await endpoints.getGallery(category);
      setItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [activeCategory]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal[600]} />
        <Text style={styles.loadingText}>Loading Workshop Gallery...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category Filter Pills */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isActive = activeCategory === item.id;
            return (
              <Pressable
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => {
                  setActiveCategory(item.id);
                  setLoading(true);
                }}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchGallery(activeCategory);
            }}
          />
        }
        contentContainerStyle={styles.galleryContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No project photos found in this category.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>AUGU SMART WORKSHOP</Text>
              </View>
            )}
            <View style={styles.cardFooter}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.itemDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </View>
          </View>
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
  categoriesContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.navy[900],
    borderColor: colors.navy[900],
  },
  categoryText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  galleryContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: colors.text.muted,
    fontSize: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 200,
    backgroundColor: colors.navy[800],
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: colors.navy[900],
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: colors.teal[400],
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  cardFooter: {
    padding: 14,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  itemDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
});
