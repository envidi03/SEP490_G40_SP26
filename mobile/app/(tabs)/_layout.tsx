import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet } from 'react-native';

import { HapticTab } from '@/src/components/layout/haptic-tab';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { useProfileData } from '@/src/hooks/useHomeData';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { data: profileData } = useProfileData();

  // Hiển thị tab nha khoa chỉ khi đã đăng nhập (có avatar hoặc tên)
  const isLoggedIn = !!(profileData?.data?.avatar_url || profileData?.data?.full_name);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dental-record"
        options={{
          title: 'Hồ sơ',
          href: isLoggedIn ? undefined : null, // null ẩn hoàn toàn tab khi chưa đăng nhập
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/images/file-medical.png')}
              style={[styles.tabIcon, { tintColor: color }]}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    height: 64,
    paddingBottom: 10,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
});
