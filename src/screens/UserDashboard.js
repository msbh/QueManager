import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList } from "react-native";
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

const UserDashboard = () => {
  const [queues, setQueues] = useState([]);
  //const [userType, setUserType] = useState('generalUser'); // Assuming you fetch userType on login
  const db = getFirestore();
  const auth = getAuth();
  const navigation = useNavigation(); // Using React Navigation for redirection
  const dispatch = useDispatch();
  // Get the userType from Redux store
  const userType = useSelector((state) => state.userType); // Access userType from Redux

  // Fetch user type from Firestore
  const checkUserType = async (user) => {
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        return userDoc.userType; // Get the user type (e.g., 'receptionist' or 'generalUser')
      } else {
        // Return a default user type if the user is not found in the database
        return "generalUser";
      }
    } catch (error) {
      console.error("Error fetching user type:", error);
      return "generalUser"; // Default type in case of error
    }
  };
  // Fetch queues from Firestore
  const fetchQueues = async () => {
    try {
      const snapshot = await getDocs(collection(db, "queues"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQueues(data);
    } catch (error) {
      console.error("Error fetching queues:", error);
    }
  };

  // Join a queue and increment the "total" count
  const joinQueue = async (queueId) => {
    try {
      const queueRef = doc(db, "queues", queueId);
      await updateDoc(queueRef, {
        total: increment(1), // Increment the total field
      });
      alert("You have joined the queue!");
      fetchQueues();
    } catch (error) {
      console.error("Error joining the queue:", error);
    }
  };
  // Handle user redirection based on userType
  /*  const handleNavigation = (type) => {
        if (type === 'receptionist') {
            navigation.navigate('ReceptionistScreen');
        } else if (type === 'serviceProvider') {
            navigation.navigate('ServiceProviderDashboard');
        } else {
            // Default navigation for general user
            navigation.navigate('UserDashboard');
        }
    };*/
  // Handle user redirection based on userType
  const handleNavigation = async () => {
    const user = auth.currentUser;
    const type = await checkUserType(user);

    // const type= checkUserType(userType);
    // setUserType(type);
    if (type === "receptionist") {
      navigation.navigate("ReceptionistScreen");
    } else if (type === "serviceProvider") {
      navigation.navigate("ServiceProviderDashboard");
    } else {
      // navigation.navigate('UserDashboard'); // Default navigation
    }
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
    //   fetchQueues();
    // debugger;
    // Optionally, fetch userType from Firestore or Redux state if required
    // This is just an example; make sure to fetch it based on how you store it in your app
    const user = auth.currentUser;
    if (user) {
      handleNavigation();
      // Assuming the userType is stored in Firestore
      // Fetch userType from Firestore and update state
      // setUserType(fetchedUserType);
    }
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18 }}>User Dashboard</Text>
      <FlatList
        data={queues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10 }}>
            <Text>
              {item.name} - Current: {item.current} / Total: {item.total}
            </Text>
            <Button title="Join Queue" onPress={() => joinQueue(item.id)} />
          </View>
        )}
      />
      {/* Add logout button */}
      <Button title="Logout" onPress={handleLogout} style={{ marginTop: 20 }} />
    </View>
  );
};

export default UserDashboard;
