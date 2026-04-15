import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import { DashboardScreen } from '../screens/DashboardScreen';
import { AppointmentsScreen } from '../screens/AppointmentsScreen';
import { AppointmentDetailsScreen } from '../screens/AppointmentDetailsScreen';
import { NewAppointmentScreen } from '../screens/NewAppointmentScreen';
import { ClientsScreen } from '../screens/ClientsScreen';
import { ClientDetailsScreen } from '../screens/ClientDetailsScreen';
import { NewClientScreen } from '../screens/NewClientScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { NotificationDetailsScreen } from '../screens/NotificationDetailsScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { BackupScreen } from '../screens/BackupScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SessionLockScreen } from '../screens/SessionLockScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { RecoverPinScreen } from '../screens/RecoverPinScreen';

import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants';
import {
  HomeIcon,
  CalendarIcon,
  ClientsIcon,
  NotificationsIcon,
  ReportsIcon,
  BackupIcon,
  ProfileIcon
} from '../components/TabIcons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = ({ canRegister }) => (
  <Stack.Navigator
    initialRouteName={canRegister ? 'Register' : 'Login'}
    screenOptions={{
      headerShown: false,
      animationEnabled: true
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="RecoverPin" component={RecoverPinScreen} />
    {canRegister && <Stack.Screen name="Register" component={RegisterScreen} />}
  </Stack.Navigator>
);

// Stack para Appointments
const AppointmentsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.SURFACE,
        borderBottomColor: COLORS.BORDER,
        borderBottomWidth: 1,
        shadowColor: COLORS.PRIMARY,
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2
      },
      headerTintColor: COLORS.PRIMARY,
      headerTitleStyle: {
        fontWeight: '700'
      }
    }}
  >
    <Stack.Screen
      name="AppointmentsList"
      component={AppointmentsScreen}
      options={{ title: 'Meus Agendamentos' }}
    />
    <Stack.Screen
      name="AppointmentDetails"
      component={AppointmentDetailsScreen}
      options={{ title: 'Detalhes do Agendamento' }}
    />
    <Stack.Screen
      name="NewAppointment"
      component={NewAppointmentScreen}
      options={{ title: 'Novo Agendamento' }}
    />
  </Stack.Navigator>
);

// Stack para Clients
const ClientsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.SURFACE,
        borderBottomColor: COLORS.BORDER,
        borderBottomWidth: 1,
        shadowColor: COLORS.PRIMARY,
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2
      },
      headerTintColor: COLORS.PRIMARY,
      headerTitleStyle: {
        fontWeight: '700'
      }
    }}
  >
    <Stack.Screen
      name="ClientsList"
      component={ClientsScreen}
      options={{ title: 'Meus Clientes' }}
    />
    <Stack.Screen
      name="ClientDetails"
      component={ClientDetailsScreen}
      options={{ title: 'Detalhes do Cliente' }}
    />
    <Stack.Screen
      name="NewClient"
      component={NewClientScreen}
      options={{ title: 'Novo Cliente' }}
    />
  </Stack.Navigator>
);

// Stack para Notifications
const NotificationsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.SURFACE,
        borderBottomColor: COLORS.BORDER,
        borderBottomWidth: 1,
        shadowColor: COLORS.PRIMARY,
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2
      },
      headerTintColor: COLORS.PRIMARY,
      headerTitleStyle: {
        fontWeight: '700'
      }
    }}
  >
    <Stack.Screen
      name="NotificationsList"
      component={NotificationsScreen}
      options={{ title: 'Notificações' }}
    />
    <Stack.Screen
      name="NotificationDetails"
      component={NotificationDetailsScreen}
      options={{ title: 'Detalhes da Notificação' }}
    />
  </Stack.Navigator>
);



const AppStack = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: COLORS.PRIMARY,
      tabBarInactiveTintColor: COLORS.TEXT_SECONDARY,
      tabBarStyle: {
        backgroundColor: COLORS.SURFACE,
        borderTopColor: COLORS.BORDER,
        borderTopWidth: 1,
        height: 66,
        paddingBottom: 10,
        paddingTop: 8,
        shadowColor: COLORS.PRIMARY,
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 10
      },
      headerStyle: {
        backgroundColor: COLORS.SURFACE,
        borderBottomColor: COLORS.BORDER,
        borderBottomWidth: 1,
        shadowColor: COLORS.PRIMARY,
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2
      },
      headerTintColor: COLORS.PRIMARY,
      headerTitleStyle: {
        fontWeight: '700'
      }
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        title: 'Início',
        tabBarLabel: 'Início',
        tabBarIcon: ({ color, focused }) => (
          <HomeIcon color={focused ? '#E91E63' : 'inactive'} size={24} />
        ),
        headerShown: false
      }}
    />

    <Tab.Screen
      name="Appointments"
      component={AppointmentsStack}
      options={{
        title: 'Agendamentos',
        tabBarLabel: 'Agendamentos',
        tabBarIcon: ({ color, focused }) => (
          <CalendarIcon color={focused ? '#2196F3' : 'inactive'} size={24} />
        ),
        headerShown: false
      }}
    />

    <Tab.Screen
      name="Clients"
      component={ClientsStack}
      options={{
        title: 'Clientes',
        tabBarLabel: 'Clientes',
        tabBarIcon: ({ color, focused }) => (
          <ClientsIcon color={focused ? '#4CAF50' : 'inactive'} size={24} />
        ),
        headerShown: false
      }}
    />

    <Tab.Screen
      name="Notifications"
      component={NotificationsStack}
      options={{
        title: 'Notificações',
        tabBarLabel: 'Notificações',
        tabBarIcon: ({ color, focused }) => (
          <NotificationsIcon color={focused ? '#FF9800' : 'inactive'} size={24} />
        ),
        headerShown: false
      }}
    />

    <Tab.Screen
      name="Reports"
      component={ReportsScreen}
      options={{
        title: 'Relatórios',
        tabBarLabel: 'Relatórios',
        tabBarIcon: ({ color, focused }) => (
          <ReportsIcon color={focused ? '#9C27B0' : 'inactive'} size={24} />
        ),
        headerTitle: 'Meus Relatórios'
      }}
    />

    <Tab.Screen
      name="Backup"
      component={BackupScreen}
      options={{
        title: 'Backup',
        tabBarLabel: 'Backup',
        tabBarIcon: ({ color, focused }) => (
          <BackupIcon color={focused ? '#455A64' : 'inactive'} size={24} />
        ),
        headerTitle: 'Backup e Exportação'
      }}
    />

    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Perfil',
        tabBarLabel: 'Perfil',
        tabBarIcon: ({ focused }) => (
          <ProfileIcon color={focused ? '#FF6F61' : 'inactive'} size={24} />
        ),
        headerTitle: 'Meu Perfil'
      }}
    />
  </Tab.Navigator>
);

const RootNavigator = () => {
  const { user, isLoading, canRegister, isSessionLocked } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      {user ? (isSessionLocked ? <SessionLockScreen /> : <AppStack />) : <AuthStack canRegister={canRegister} />}
    </NavigationContainer>
  );
};

export default RootNavigator;
