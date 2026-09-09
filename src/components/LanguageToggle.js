import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../utils/colors';

const LANGUAGES = ['English', 'Telugu', 'Hindi'];

export default function LanguageToggle({ onSelectLanguage }) {
  const [selected, setSelected] = useState('English');

  const handlePress = (lang) => {
    setSelected(lang);
    if (onSelectLanguage) onSelectLanguage(lang);
  };

  return (
    <View style={styles.container}>
      {LANGUAGES.map(lang => (
        <TouchableOpacity
          key={lang}
          style={[styles.tab, selected === lang && styles.tabActive]}
          onPress={() => handlePress(lang)}
        >
          <Text style={[styles.tabText, selected === lang && styles.tabTextActive]}>
            {lang}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#000',
  },
});
