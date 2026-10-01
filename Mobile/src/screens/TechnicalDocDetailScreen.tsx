import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
  ActivityIndicator,
  Share,
} from "react-native";
import { colors } from "../theme/colors";
import { Button } from "../components/Common";
import {
  BookOpen,
  Clock,
  Tag,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Share2,
  MessageSquare,
} from "lucide-react-native";

export const TechnicalDocDetailScreen = ({ route, navigation }: any) => {
  const { doc } = route.params || {};

  if (!doc) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Documentation article not found.</Text>
        <View style={{ marginTop: 16 }}>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${doc.title}\n\n${doc.summary}\n\nAUGU SMART ELECTRONIC SERVICE Technical Knowledge Base`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleConsultWhatsApp = () => {
    Linking.openURL(
      `https://wa.me/250788111222?text=Hello%20AUGU%20SMART,%20I%20have%20a%20technical%20question%20regarding%20${encodeURIComponent(
        doc.title
      )}.`
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{doc.category}</Text>
          </View>
          <View style={styles.readTimeBadge}>
            <Clock size={12} color={colors.teal[400]} />
            <Text style={styles.readTimeText}>{doc.readTime}</Text>
          </View>
        </View>

        <Text style={styles.title}>{doc.title}</Text>
        <Text style={styles.summary}>{doc.summary}</Text>
      </View>

      <View style={styles.content}>
        {/* Verification Strip */}
        <View style={styles.verifyStrip}>
          <ShieldCheck size={20} color={colors.teal[600]} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.verifyTitle}>Workshop Verified Documentation</Text>
            <Text style={styles.verifySubtitle}>
              Standard operating procedures tested on live bench hardware and enterprise installations in Kigali.
            </Text>
          </View>
        </View>

        {/* Formatted Content Blocks */}
        <View style={styles.docBody}>
          {doc.content.split("\n\n").map((block: string, index: number) => {
            const trimmed = block.trim();
            if (trimmed.startsWith("### ")) {
              return (
                <Text key={index} style={styles.sectionHeader}>
                  {trimmed.replace("### ", "")}
                </Text>
              );
            }
            if (trimmed.startsWith("- ") || trimmed.startsWith("1. ")) {
              return (
                <View key={index} style={styles.codeBlock}>
                  <Text style={styles.codeText}>{trimmed}</Text>
                </View>
              );
            }
            return (
              <Text key={index} style={styles.paragraph}>
                {trimmed}
              </Text>
            );
          })}
        </View>

        {/* Tags */}
        {doc.keywords && doc.keywords.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsTitle}>Keywords & Tags</Text>
            <View style={styles.tagsWrap}>
              {doc.keywords.map((kw: string, i: number) => (
                <View key={i} style={styles.tagItem}>
                  <Tag size={10} color={colors.text.secondary} />
                  <Text style={styles.tagText}>{kw}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Consultation Actions */}
        <View style={styles.actions}>
          <Button
            title="Ask a Technician on WhatsApp"
            onPress={handleConsultWhatsApp}
            icon={<MessageSquare size={16} color="#FFFFFF" />}
          />
          <View style={{ height: 10 }} />
          <Button
            title="Share Document"
            variant="outline"
            onPress={handleShare}
            icon={<Share2 size={16} color={colors.teal[600]} />}
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
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  notFoundText: {
    color: colors.text.secondary,
    fontSize: 15,
  },
  header: {
    backgroundColor: colors.navy[900],
    padding: 20,
    paddingTop: 24,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: "rgba(20, 184, 166, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.4)",
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.teal[400],
    textTransform: "uppercase",
  },
  readTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readTimeText: {
    fontSize: 11,
    color: "#94A3B8",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 26,
  },
  summary: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 8,
    lineHeight: 18,
  },
  content: {
    padding: 16,
  },
  verifyStrip: {
    flexDirection: "row",
    backgroundColor: colors.teal[50],
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.3)",
    alignItems: "center",
    marginBottom: 20,
  },
  verifyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy[900],
  },
  verifySubtitle: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 15,
  },
  docBody: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.navy[900],
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  codeBlock: {
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.teal[600],
    marginBottom: 12,
  },
  codeText: {
    fontSize: 12,
    color: colors.navy[900],
    fontFamily: "monospace",
    lineHeight: 18,
  },
  tagsSection: {
    marginTop: 20,
  },
  tagsTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.muted,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  actions: {
    marginTop: 24,
    marginBottom: 40,
  },
});
