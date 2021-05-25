/* globals firebase firebaseui Sentry */

var uiConfig = {
  signInSuccessUrl: '/',
  signInOptions: [firebase.auth.GithubAuthProvider.PROVIDER_ID],
  signInFlow: 'popup',
  tosUrl: 'tos.html',
  callbacks: {
    signInSuccess: () => false
  }
};
window.uiConfig = uiConfig;

var uiAuth;
window.uiAuth = uiAuth;

const initApp = ({loginUserFn, logoutUserFn}) => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      loginUserFn(user);
    } else {
      logoutUserFn(user);
    }
  }, function (error) {
    Sentry.captureException(error);
  });
};

const signIn = () => {
  uiConfig.signInSuccessUrl = location.pathname;
  uiAuth.start('#firebaseui-auth-container', uiConfig);
};
window.signIn = signIn;

const signOut = () => {
  firebase.auth().signOut();
};
window.signOut = signOut;

const startFirebase = () => {
  uiAuth = new firebaseui.auth.AuthUI(firebase.auth());
};

const config = {
  apiKey: "AIzaSyD1q8d3i0jikA5jRQKcDydFbIw8v2bFRc0",
  authDomain: "cartographer-a6f04.firebaseapp.com",
  databaseURL: "https://cartographer-a6f04.firebaseio.com",
  projectId: "cartographer-a6f04",
  storageBucket: "",
  messagingSenderId: "489953549172"
};

console.log("firebase.initializeApp");
firebase.initializeApp(config);
