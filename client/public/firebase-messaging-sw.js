importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDM9KuNuUtsYNk7nPDVuDaVSuigBzNOZOc",
  authDomain: "meditrack-677c3.firebaseapp.com",
  projectId: "meditrack-677c3",
  storageBucket: "meditrack-677c3.firebasestorage.app",
  messagingSenderId: "466841077698",
  appId: "1:466841077698:web:d15d6c8af18bd7d9a0385b",
  measurementId: "G-2FS3WNL1BC"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'MediTrack';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/medical(2).png',
    badge: '/medical(2).png',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});