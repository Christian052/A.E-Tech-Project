import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { colors } from "../theme/colors";
import { endpoints } from "../api/endpoints";
import { TrainingProgram } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "../components/Common";
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  BookOpen,
} from "lucide-react-native";

export const TrainingScreen = ({ navigation }: any) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);

  const fetchPrograms = async () => {
    try {
      const data = await endpoints.getTrainingPrograms();
      setPrograms(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal[600]} />
        <Text style={styles.loadingText}>{t.training.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={programs}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPrograms();
            }}
          />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{t.training.title}</Text>
            <Text style={styles.subtitle}>
              {t.training.subtitle}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.badgeRow}>
                <View style={styles.durationBadge}>
                  <Clock size={12} color={colors.teal[600]} />
                  <Text style={styles.durationText}>{item.duration}</Text>
                </View>
                {item.internshipIncluded && (
                  <View style={styles.internshipBadge}>
                    <CheckCircle2 size={12} color={colors.navy[900]} />
                    <Text style={styles.internshipText}>{t.training.internship}</Text>
                  </View>
                )}
              </View>
              {item.price ? (
                <Text style={styles.price}>{item.price.toLocaleString()} RWF</Text>
              ) : null}
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>

            {item.curriculum && item.curriculum.length > 0 && (
              <View style={styles.curriculumBox}>
                <Text style={styles.curriculumHeader}>Modules Covered:</Text>
                {item.curriculum.slice(0, 3).map((mod, idx) => (
                  <View key={idx} style={styles.moduleRow}>
                    <BookOpen size={14} color={colors.teal[600]} />
                    <Text style={styles.moduleText}>{mod}</Text>
                  </View>
                ))}
              </View>
            )}

            <Button
              title={t.training.apply}
              onPress={() =>
                navigation.navigate("TrainingApply", {
                  programId: item._id,
                  programTitle: item.title,
                })
              }
            />
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
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.navy[900],
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
    lineHeight: 18,
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
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.teal[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.teal[600],
  },
  internshipBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.amber[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.amber[400],
  },
  internshipText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.navy[900],
  },
  price: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.navy[900],
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
    marginBottom: 14,
  },
  curriculumBox: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  curriculumHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 6,
  },
  moduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  moduleText: {
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
  },
});
