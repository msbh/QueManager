import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import store from "./src/redux/store";

// Screens
import LoginScreen from "./src/screens/LoginScreen";
import RegistrationScreen from "./src/screens/RegistrationScreen";
import AdminDashboard from "./src/screens/AdminDashboard";
import UserDashboard from "./src/screens/UserDashboard";
import ServiceProviderDashboard from "./src/screens/ServiceProviderDashboard";
import ReceptionistScreen from "./src/screens/ReceptionistScreen";
import AppNavigator from "./navigation/AppNavigator";

const App = () => {
  return <AppNavigator />;
};
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoginScreen">
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen
            name="RegistrationScreen"
            component={RegistrationScreen}
          />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="UserDashboard" component={UserDashboard} />
          <Stack.Screen
            name="ServiceProviderDashboard"
            component={ServiceProviderDashboard}
          />
          <Stack.Screen
            name="ReceptionistScreen"
            component={ReceptionistScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
