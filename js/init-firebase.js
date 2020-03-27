const config = {
  apiKey: "AIzaSyD1q8d3i0jikA5jRQKcDydFbIw8v2bFRc0",
  authDomain: "cartographer-a6f04.firebaseapp.com",
  databaseURL: "https://cartographer-a6f04.firebaseio.com",
  projectId: "cartographer-a6f04",
  storageBucket: "",
  messagingSenderId: "489953549172"
};
const uiConfig = {
  signInSuccessUrl: '/', // <url-to-redirect-to-on-success>
  signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      /*
      firebase.auth.GithubAuthProvider.PROVIDER_ID
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      firebase.auth.PhoneAuthProvider.PROVIDER_ID
      */
  ],
  signInFlow: 'popup',
  tosUrl: 'tos.html'
};
let uiAuth;

console.log("firebase.initializeApp");
firebase.initializeApp(config);

startFirebase();
