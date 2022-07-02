const configureRooms = () => {
  document.querySelectorAll(".room").forEach((el) => {
    const roomID = "bw-" + el.id;
    const svg = `
  <svg class="camera" width=48 height=32 style="display:block">
    <g id="${roomID}" transform="translate(0,0) scale(0.4)">
      <path class="bubble" d="M 31.848061,7.6290677 A 28.403238,22.039304 0 0 0 3.596657,29.668006 28.403238,22.039304 0 0 0 10.583386,44.14469 L 7.6648251,56.370967 20.270838,49.740068 A 28.403238,22.039304 0 0 0 32,51.707502 28.403238,22.039304 0 0 0 60.403343,29.668006 28.403238,22.039304 0 0 0 32,7.6290677 a 28.403238,22.039304 0 0 0 -0.151939,0 z"
      fill="rgba(255,255,255,0.4)"></path>
      <path class="video" d="m 16.837732,20.440612 v 19.377113 h 24.589197 v -8.876977 l 3.412712,1.970421 5.397084,3.11609 v -6.232178 -6.232178 l -5.397084,3.116088 -3.412712,1.970423 v -8.208802 z"
      fill="white" stroke-width="5"></path>
      <text font-size="30" x="70" y="50" fill="white"></text>
      <g transform="translate(30,30)"><circle cx="0" cy="0" r="1" stroke-width="0.1" fill="none" stroke="white" /></g>
    </g>
  </svg>`;
    el.innerHTML = svg + el.innerHTML;
  });
};
configureRooms();

let rooms;

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

  rooms = firebase.database().ref('rooms');
  rooms.on('value', (s) => {
    const val = s.val();
    if (val === null) {
      return;
    }
    console.log(val);
    for(const key in val) {
      if ({}.hasOwnProperty.call(val, key)) {
        document.querySelector(`#${key} > .subject`).value = val[key];
        console.log(key, val[key]);
      }
    }
  });
});

const roomRename = (ev) => {
  const key = ev.parentElement.id;
  const value = ev.value;
  console.log(`roomRename id=${key} value=${value}`);
  ev.blur();
  rooms.update({key: value});
};
window.roomRename = roomRename;
