import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDM9KuNuUtsYNk7nPDVuDaVSuigBzNOZOc",
  authDomain: "meditrack-677c3.firebaseapp.com",
  projectId: "meditrack-677c3",
  storageBucket: "meditrack-677c3.firebasestorage.app",
  messagingSenderId: "466841077698",
  appId: "1:466841077698:web:d15d6c8af18bd7d9a0385b",
  measurementId: "G-2FS3WNL1BC"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = () => {
  return getToken(messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY' })
    .then((currentToken) => {
      if (currentToken) {
        console.log('Current token for client: ', currentToken);
        
      }
    })
    .catch((err) => console.log('An error occurred while retrieving token. ', err));
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });