import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import UserDashboard from './src/screens/UserDashboard';
import ServiceProviderDashboard from './src/screens/ServiceProviderDashboard';
import { Provider } from 'react-native-redux';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
         <Provider >

    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="UserDashboard" component={UserDashboard} />
        <Stack.Screen name="ServiceProviderDashboard" component={ServiceProviderDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
    </Provider>
  );
}
