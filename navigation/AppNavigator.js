import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import UserDashboard from "../screens/UserDashboard";
import AddToQueueScreen from "../screens/AddToQueueScreen";
import { Ionicons } from "@expo/vector-icons"; // or any other icon library

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === "Dashboard") {
              iconName = "home";
            } else if (route.name === "AddToQueue") {
              iconName = "qr-code";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: "tomato",
          inactiveTintColor: "gray",
        }}
      >
        <Tab.Screen name="Dashboard" component={UserDashboard} />
        <Tab.Screen name="AddToQueue" component={AddToQueueScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
