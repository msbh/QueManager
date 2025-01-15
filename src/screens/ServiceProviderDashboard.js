import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList } from "react-native";
import firebase from "../firebase/firebaseConfig";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native"; // For navigation to other screens
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/actions"; // Import logout action
import { useSelector } from "react-redux";

const ServiceProviderDashboard = () => {
  const [queues, setQueues] = useState([]);
  const db = getFirestore();
  const auth = getAuth();
  const navigation = useNavigation(); // Using React Navigation for redirection
  const dispatch = useDispatch();

  const updateQueue = async (queueId) => {
    const queueRef = firebase.firestore().collection("queues").doc(queueId);
    await queueRef.update({
      current: firebase.firestore.FieldValue.increment(1),
    });
    alert("Queue updated!");
    fetchQueues();
  };

  const fetchQueues = async () => {
    const snapshot = await firebase.firestore().collection("queues").get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setQueues(data);
  };
  // Log out the user
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully");
      dispatch(logoutUser()); // Dispatch logout action
      navigation.navigate("LoginScreen"); // Redirect to login screen
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
    }
  };
  useEffect(() => {
    fetchQueues();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18 }}>Service Provider Dashboard</Text>
      <FlatList
        data={queues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10 }}>
            <Text>
              {item.name} - Current: {item.current} / Total: {item.total}
            </Text>
            <Button title="Mark as Done" onPress={() => updateQueue(item.id)} />
          </View>
        )}
      />
      {/* Add logout button */}
      <Button title="Logout" onPress={handleLogout} style={{ marginTop: 20 }} />
    </View>
  );
};

export default ServiceProviderDashboard;
