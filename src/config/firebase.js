import { getApps, initializeApp } from "firebase/app";

// TODO: PUT THESE INTO AN ENV FILE!
const FIREBASE_API_KEY = "AIzaSyD-CENJtlsAWz2XsDPil4JU-dkCd_EU2Bc";
const FIREBASE_AUTH_DOMAIN = "website-fdblock.firebaseapp.com";
const FIREBASE_DATABASE_URL = "https://website-fdblock.firebaseio.com";
const FIREBASE_PROJECT_ID = "website-fdblock";
const FIREBASE_STORAGE_BUCKET = "website-fdblock.appspot.com";
const FIREBASE_MESSAGING_SENDER_ID = "574157456962";
const FIREBASE_APP_ID = "1:574157456962:web:1bee24323aadae1d";

// Initialize Firebase
const config = {
    apiKey: `${FIREBASE_API_KEY}`,
    authDomain: `${FIREBASE_AUTH_DOMAIN}`,
    databaseURL: `${FIREBASE_DATABASE_URL}`,
    projectId: `${FIREBASE_PROJECT_ID}`,
    storageBucket: `${FIREBASE_STORAGE_BUCKET}`,
    messagingSenderId: `${FIREBASE_MESSAGING_SENDER_ID}`,
    appId: `${FIREBASE_APP_ID}`,
};

let app = null;
if (getApps().length < 1) {
    app = initializeApp(config);
} else {
    app = getApps()[0];
}

export { app };
