
function initApp() {
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      const { displayName, photoURL, providerData } = user;
      document.querySelector("#userAvatar img").src = photoURL;
      document.querySelector("#userAvatar").style.display = "inline-block";
      document.getElementById("loginStatus").innerHTML = `${displayName} (<a style="color:white" href="#" onclick="signOut()">Sign Out</a>)`;

      const { uid } = providerData[0];
      window.app.userSignedIn = true;
      window.app.uid = uid;
      if (displayName) {
        window.app.userDisplayName = displayName;
      } else {
        const json = await fetchUserInfoFromGitHub(uid);
        window.app.userDisplayName = json.login;
      }
      window.app.userPicture = photoURL;
    } else {
      window.app.userSignedIn = false;
      window.app.uid = null;
      window.app.userDisplayName = null;
      window.app.userGitHubName = null;
      window.app.userPicture = null;
      document.querySelector("#userAvatar").style.display = "none";
      document.querySelector("#userAvatar img").src = "";
      document.getElementById("loginStatus").innerHTML = `<a style="color:white" href="#" onclick="signIn()">Sign In</a>`;
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
  window.addEventListener('load', function () {
    initApp();
  });
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
  tosUrl: 'tos.html'
};
window.uiConfig = uiConfig;
var uiAuth;
window.uiAuth = uiAuth;

console.log("firebase.initializeApp");
firebase.initializeApp(config);

startFirebase();
