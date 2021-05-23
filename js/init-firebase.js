
function initApp({loginUserFn, logoutUserFn}) {
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      loginUserFn(user);
    } else {
      logoutUserFn(user);
    }
  }, function (error) {
    Sentry.captureException(error);
  });
}

function signIn() {
  uiConfig.signInSuccessUrl = location.pathname;
  uiAuth.start('#firebaseui-auth-container', uiConfig);
}
window.signIn = signIn;

function signOut() {
  firebase.auth().signOut();
}
window.signOut = signOut;

function startFirebase() {
  uiAuth = new firebaseui.auth.AuthUI(firebase.auth());
}

const config = {
  apiKey: "AIzaSyD1q8d3i0jikA5jRQKcDydFbIw8v2bFRc0",
  authDomain: "cartographer-a6f04.firebaseapp.com",
  databaseURL: "https://cartographer-a6f04.firebaseio.com",
  projectId: "cartographer-a6f04",
  storageBucket: "",
  messagingSenderId: "489953549172"
};

var uiConfig = {
  signInSuccessUrl: '/',
  signInOptions: [
    firebase.auth.GithubAuthProvider.PROVIDER_ID
  ],
  signInFlow: 'popup',
  tosUrl: 'tos.html',
  callbacks: {
    signInSuccess: () => { return false; }
  }
};
window.uiConfig = uiConfig;

var uiAuth;
window.uiAuth = uiAuth;

console.log("firebase.initializeApp");
firebase.initializeApp(config);
