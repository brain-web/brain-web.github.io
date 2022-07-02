/* global Vue Quasar */
/* eslint-disable camelcase */

Quasar.Dark.set(true);

const app = new Vue({
  el: '#q-app',
  data () {
    return {
      projects: []
    };
  },
  methods: {
    goTo (url) {
      window.location = url;
    }
  }
});

// eslint-disable-next-line no-undef
startFirebase();
window.addEventListener('load', () => {
  // eslint-disable-next-line no-undef
  initApp({
    loginUserFn: (user) => {
      const { displayName, photoURL } = user;
      document.querySelector("#userAvatar img").src = photoURL;
      document.querySelector("#userAvatar").style.display = "inline-block";
      document.getElementById("loginStatus").innerHTML = `<span id="user">${displayName}</span> (<a style="color:white" href="#" onclick="signOut()">Sign Out</a>)`;
    },
    logoutUserFn: () => {
      document.querySelector("#userAvatar").style.display = "none";
      document.querySelector("#userAvatar img").src = "";
      document.getElementById("loginStatus").innerHTML = `<a style="color:white" href="#" onclick="signIn()">Sign In</a>`;
      document.querySelectorAll(".logged").forEach((el) => { el.classList.remove("logged"); });
    }
  });
});
