import React from 'react';
import { StyleSheet, View, Text, Platform, Image, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ScannerScreen from './src/screens/ScannerScreen';
import ReportDashboardScreen from './src/screens/ReportDashboardScreen';
import SOScreen from './src/screens/SOScreen';
import { Feather } from '@expo/vector-icons'; // For icons
import { glassmorphic } from './src/utils/colors';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#00BFA6',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: 'rgba(18, 18, 18, 0.8)',
            height: 60,
            paddingTop: Platform.OS === 'ios' ? 0 : 0,
            borderTopWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif-medium',
          },
          tabBarIconStyle: {
            width: 24,
            height: 24,
          },
        })}
        tabBarOptions={{
          showLabel: true,
          activeTintColor: '#00BFA6',
          inactiveTintColor: '#8E8E93',
          style: {
            backgroundColor: 'rgba(18, 18, 18, 0.8)',
          },
        }}
      >
        <Tab.Screen
          name="Scanner"
          component={ScannerScreen}
          options={{
            tabBarLabel: 'Scan',
            tabBarIcon: ({ color, size }) => (
              <Feather name="camera" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Reports"
          component={ReportDashboardScreen}
          options={{
            tabBarLabel: 'Reports',
            tabBarIcon: ({ color, size }) => (
              <Feather name="file-text" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="SOS"
          component={SOScreen}
          options={{
            tabBarLabel: 'SOS',
            tabBarIcon: ({ color, size }) => (
              <Feather name="alert-triangle" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}