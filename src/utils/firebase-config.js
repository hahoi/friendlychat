/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */
const config = {
  /* TODO: ADD YOUR FIREBASE CONFIGURATION OBJECT HERE */
  apiKey: "AIzaSyASdfmEa3H6w6NNhGnaPrFnbMcZprwGYs0",
  authDomain: "friendlychat-67065.firebaseapp.com",
  projectId: "friendlychat-67065",
  storageBucket: "friendlychat-67065.appspot.com",
  messagingSenderId: "457862645399",
  appId: "1:457862645399:web:824fc9323456e071310bd2"
};

export function getFirebaseConfig () {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
      'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}