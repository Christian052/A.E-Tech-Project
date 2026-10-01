import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { LanguageCode } from "../locales/translations";
import { Globe, Check } from "lucide-react-native";

export const LanguageSwitcherModal: React.FC = () => {
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const [visible, setVisible] = useState(false);

  const current = availableLanguages.find((l) => l.code === language) || availableLanguages[0];

  const handleSelect = async (code: LanguageCode) => {
    await setLanguage(code);
    setVisible(false);
  };

  return (
    <>
      {/* Trigger Button in Header */}
      <Pressable
        style={styles.triggerButton}
        onPress={() => setVisible(true)}
        hitSlop={8}
      >
        <Text style={styles.flagText}>{current.flag}</Text>
        <Text style={styles.codeText}>{current.short}</Text>
      </Pressable>

      {/* Modal Dialog for Language Selection */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dialog}>
                <View style={styles.dialogHeader}>
                  <Globe size={18} color={colors.teal[600]} />
                  <Text style={styles.dialogTitle}>{t.common.selectLanguage}</Text>
                </View>

                <View style={styles.optionsList}>
                  {availableLanguages.map((item) => {
                    const isSelected = item.code === language;
                    return (
                      <Pressable
                        key={item.code}
                        style={[
                          styles.optionItem,
                          isSelected && styles.optionItemSelected,
                        ]}
                        onPress={() => handleSelect(item.code)}
                      >
                        <View style={styles.optionLeft}>
                          <Text style={styles.optionFlag}>{item.flag}</Text>
                          <View>
                            <Text
                              style={[
                                styles.optionName,
                                isSelected && styles.optionNameSelected,
                              ]}
                            >
                              {item.name}
                            </Text>
                            <Text style={styles.optionSub}>
                              {item.code === "rw"
                                ? "Kinyarwanda cy'umwimerere"
                                : item.code === "fr"
                                ? "Français standard"
                                : "International English"}
                            </Text>
                          </View>
                        </View>

                        {isSelected && (
                          <Check size={18} color={colors.teal[600]} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => setVisible(false)}
                >
                  <Text style={styles.cancelText}>{t.common.cancel}</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  flagText: {
    fontSize: 13,
  },
  codeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 25, 47, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  dialogHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  dialogTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.navy[900],
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  optionItemSelected: {
    borderColor: colors.teal[500],
    backgroundColor: colors.teal[50],
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionFlag: {
    fontSize: 20,
  },
  optionName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy[900],
  },
  optionNameSelected: {
    color: colors.teal[700],
  },
  optionSub: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },
  cancelBtn: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
});
