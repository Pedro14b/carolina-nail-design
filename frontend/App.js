import React from 'react';
import { View } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { SyncProvider } from './src/context/SyncContext';
import RootNavigator from './src/navigation/RootNavigator';
import AppSync from './src/components/AppSync';
import { useAuth } from './src/context/AuthContext';

const ActivityLayer = ({ children }) => {
  const { markActivity } = useAuth();

  return (
    <View style={{ flex: 1 }} onTouchStart={markActivity}>
      {children}
    </View>
  );
};

export default function App() {
  return (
    <SyncProvider>
      <AuthProvider>
        <ActivityLayer>
          <AppSync>
            <RootNavigator />
          </AppSync>
        </ActivityLayer>
      </AuthProvider>
    </SyncProvider>
  );
}
