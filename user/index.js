/* global Vue Quasar */
/* eslint-disable camelcase */
import * as BWData from "../community/brainweb-data.js";
import * as BWFirebase from "../community/brainweb-firebase.js";

Quasar.Dark.set(true);

const app = new Vue({
  el: '#q-app',
  data () {
    return {
      userSignedIn: false,
      userName: "",
      userDisplayName: "",
      userPicture: "",
      personSkills: [],
      skills: []
    };
  },
  methods: {
    goTo (url) {
      window.location = url;
    }
  }
});

const dataReceived = (circle) => {

  const skills = Array.from(new Set(Object.keys(circle).map((k) => {
    if(circle[k].skills) {
      return circle[k].skills.map((s) => s.toLowerCase().trim());
    }

    return [];
  })
    .flat()));

  app.skills.length = 0;
  app.skills.push(...skills);

  console.log(circle["2310732"]);
  app.userName = circle["2310732"].username;
  // app.displayName = circle["2310732"].displayname;
  app.personSkills.length = 0;
  app.personSkills.push(...circle["2310732"].skills);
};

BWFirebase.init({
  BWData,
  dataReceivedFn: dataReceived
});

// eslint-disable-next-line no-undef
startFirebase();
window.addEventListener('load', () => {
  // eslint-disable-next-line no-undef
  initApp({
    loginUserFn: async (user) => {
      const { displayName, photoURL, providerData } = user;
      document.querySelector("#userAvatar img").src = photoURL;
      document.querySelector("#userAvatar").style.display = "inline-block";
      document.getElementById("loginStatus").innerHTML = `<span id="user">${displayName}</span> (<a style="color:white" href="#" onclick="signOut()">Sign Out</a>)`;

      const [{uid}] = providerData;
      app.uid = uid;
      app.userSignedIn = true;
      app.userDisplayName = displayName?displayName:((await BWData.fetchUserInfoFromGitHub(uid)).login);
      app.userPicture = photoURL;
    },
    logoutUserFn: () => {
      document.querySelector("#userAvatar").style.display = "none";
      document.querySelector("#userAvatar img").src = "";
      document.getElementById("loginStatus").innerHTML = `<a style="color:white" href="#" onclick="signIn()">Sign In</a>`;
      document.querySelectorAll(".logged").forEach((el) => { el.classList.remove("logged"); });

      app.userSignedIn = false;
      app.uid = null;
      app.userDisplayName = null;
      app.userGitHubName = null;
      app.userPicture = null;
    }
  });

  BWFirebase.listen({
    circleName: "BrainWeb"
  });
});
