/* eslint-disable radix */

const domain = 'meet.jit.si';
const options = {
  roomName: 'BrainWeb',
  width: "100%",
  height: "100%",
  parentNode: document.querySelector('#jitsi')
};

// eslint-disable-next-line no-undef
const api = new JitsiMeetExternalAPI(domain, options);

const feedbackAnimationStep = (timer, elem) => {
  const dx = 500 * Math.random() - 250;
  const x = parseInt("0" + elem.style.left);
  const y = parseInt("0" + elem.style.top);
  const newx = 0.9*x + 0.1*(x+dx);
  const newy = y - 25;
  elem.style.left = newx + "px";
  elem.style.top = newy + "px";
  if(newy <= 0 ) {
    clearInterval(timer);
    elem.remove();
  }
};

const feedbackAnimation = (emoji) => {
  const elem = document.createElement('div');
  elem.innerText = emoji;
  elem.classList.add("feedback");
  document.body.appendChild(elem);
  elem.style.left = window.innerWidth/2.0 + "px";
  elem.style.top = window.innerHeight + "px";
  const timer = setInterval( () => {
    feedbackAnimationStep(timer, elem);
  }, 25);
};

const broadcastMessage = (msg) => {
  // eslint-disable-next-line guard-for-in
  for(const participant in api._participants) {
    if(!{}.hasOwnProperty.call(api._participants, participant)) {
      continue;
    }
    const itsme = (api._participants[participant].formattedDisplayName.slice(-5) === " (me)");
    if(itsme) {
      continue;
    }
    api.executeCommand('sendEndpointTextMessage', participant, JSON.stringify(msg));
  }
};

// eslint-disable-next-line no-unused-vars
const feedback = (emoji) => {
  feedbackAnimation(emoji);
  broadcastMessage({type:"feedback", emoji});
};
window.feedback = feedback;

api.addEventListener('endpointTextMessageReceived', (rawMsg) => {
  const {text} = rawMsg.data.eventData;
  const msg = JSON.parse(text);
  switch(msg.type) {
  case "feedback": {
    const {emoji} = msg;
    feedbackAnimation(emoji);
    break;
  }
  case "clap":
    // playClapSound();
    break;
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
