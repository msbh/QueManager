import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
   
};
//
// Initialize Firebase
//const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore
const auth = getAuth(app); // Initialize Auth

export { db, auth };
