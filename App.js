import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import AdminDashboard from './src/screens/AdminDashboard';
import UserDashboard from './src/screens/UserDashboard';
import ServiceProviderDashboard from './src/screens/ServiceProviderDashboard';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AdminDashboard">
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="UserDashboard" component={UserDashboard} />
        <Stack.Screen name="ServiceProviderDashboard" component={ServiceProviderDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}