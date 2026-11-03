import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  Scale, 
  Briefcase, 
  Calendar, 
  Sparkles, 
  Users, 
  Settings, 
  CheckSquare, 
  IndianRupee 
} from 'lucide-react-native';

import { DashboardScreen } from '../screens/DashboardScreen';
import { CasesScreen } from '../screens/CasesScreen';
import { HearingsScreen } from '../screens/HearingsScreen';
import { AICopilotScreen } from '../screens/AICopilotScreen';
import { ClientsScreen } from '../screens/ClientsScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { BillingScreen } from '../screens/BillingScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      id="main-tabs"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.bg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTitleStyle: {
          color: theme.colors.text,
          fontWeight: '800',
          fontSize: 16,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.bgCard,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.primaryLight,
        tabBarInactiveTintColor: theme.colors.textDim,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerTitle: 'Legal Copilot • Chamber',
          tabBarLabel: 'Chamber',
          tabBarIcon: ({ color, size }) => <Scale color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Cases"
        component={CasesScreen}
        options={{
          headerTitle: 'Litigation Dockets',
          tabBarLabel: 'Cases',
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="AICopilot"
        component={AICopilotScreen}
        options={{
          headerTitle: 'Statutory Legal AI',
          tabBarLabel: 'AI Copilot',
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Hearings"
        component={HearingsScreen}
        options={{
          headerTitle: 'Cause List Listings',
          tabBarLabel: 'Hearings',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientsScreen}
        options={{
          headerTitle: 'Client CRM Directory',
          tabBarLabel: 'Clients',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          headerTitle: 'Procedural Deadlines',
          tabBarLabel: 'Tasks',
          tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Billing"
        component={BillingScreen}
        options={{
          headerTitle: 'Professional Fee Memos',
          tabBarLabel: 'Billing',
          tabBarIcon: ({ color, size }) => <IndianRupee color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: 'Chamber Settings & Sync',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size - 2} />,
        }}
      />
    </Tab.Navigator>
  );
};

