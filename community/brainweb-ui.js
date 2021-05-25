/* globals Quasar Vue*/

import * as BWData from "./brainweb-data.js";

let app;

export const setAttributes = (obj) => {
  for(const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      app[key] = obj[key];
    }
  }
};

export const getAttribute = (key) => app[key];

/**
 * app.people, referred as peopleArr in functions, is the array
 * containing all the people in a graph. Each entry has the
 * following properties:
 *  {string} uid  "1234", the userID number from Github
 *  {string} username: "josmith98", the userID nickname from Github
 *  {string} displayname: "John Smith", the displayName from Github
 *  {array} skills: []
 *
 * the skills array contains a list of strings, each a skill.
 */

/**
 * databaseDic is a dictionary with people information, as it
 * comes from Firebase. Each key is a userID, and the
 * properties are:
 * {string} displayName
 * {string} username
 * {array} skills
 */

/**
 * Convert the current peopleArr in app.people to a databaseDic.
 * The result is uploaded to Firebase under the specified
 * circleName and uid.
 * @returns {void}
 */
export const peopleArrToDatabaseDic = ({circleName, uid, updateUserFn}) => {
  const arr = [];
  for(const p of app.people) {
    arr.push(JSON.parse(JSON.stringify(p)));
  }
  const databaseDic = BWData.arr2dic(arr);
  updateUserFn({databaseDic, circleName, uid});
};

/**
 * Takes a dictionary with people (as provided by Firebase) and pushes
 * it to the people array app.people used for display.
 * @param {object} incomingPeopleDic Dictionary with people and their skills
 * @returns {void}
 */
export const databaseDicToPeopleArr = (incomingPeopleDic) => {
  const incomingPeopleArr = BWData.dic2arr(incomingPeopleDic);
  const newPeople = incomingPeopleArr.filter((person) => {
    const oldUIDs = app.people.map((o) => o.uid);
    const includes = !(oldUIDs.includes(person.uid));

    return includes;
  });

  for(const p of newPeople) {
    if(typeof p.skills === "undefined") {
      p.skills = [];
    }
    if(typeof p.displayname === "undefined") {
      p.displayname = p.username;
    }
    for(const s of p.skills) {
      if(!app.skills.includes(s)) {
        app.skills.push(s);
      }
    }
    app.people.push(p);
  }
};

/**
 * Display user data
 * @param {object} user User data
 * @returns {void}
 */
export const displayUserCard = (user) => {
  app.cardDisplayName = user.displayname;
  app.cardGitHubName = user.username;
  app.cardUID = user.uid;
  app.cardSkills = user.skills;
  app.displayCard = true;
};

// eslint-disable-next-line max-statements
export const addCurrentUser = async ({circleName, circleSkill, updateUserFn}) => {
  // do not add if no user is logged in
  if(app.uid === null) {
    return;
  }

  // find if it's a new user and if displayName is set
  const index = app.people.map((o) => o.uid).indexOf(app.uid);
  const isNewUser = (index === -1);
  const isUserWithoutDisplayName = (typeof app.userDisplayName === "undefined");

  // fetch and update user information if it's a new
  // user or if the displayName was not set.
  if (isNewUser || isUserWithoutDisplayName) {
    const {login} = await BWData.fetchUserInfoFromGitHub(app.uid);
    const userDisplayName = app.userDisplayName || login;
    app.userDisplayName = userDisplayName;
    app.userGitHubName = login;
    if (isNewUser) {
      app.people.push({
        displayname: userDisplayName,
        username: login,
        uid: app.uid,
        skills: circleSkill?[circleSkill]:[]
      });
    }
    peopleArrToDatabaseDic({circleName, uid: app.uid, updateUserFn});
  } else {
    if(circleSkill) {
      if (!app.people[index].skills.map((s) => s.toLowerCase()).includes(circleSkill)) {
        app.people[index].skills.push(circleSkill);
        peopleArrToDatabaseDic({circleName, uid: app.uid, updateUserFn});
      }
    }
    app.userGitHubName = app.people[index].username;
  }

  const newUser = app.people[index];
  if(newUser) {
    document.getElementById('user').addEventListener(
      'click',
      () => { displayUserCard(newUser); }
    );
  }
};

export const loginUser = async (user) => {
  const { displayName, photoURL, providerData } = user;

  document.querySelector("#userAvatar img").src = photoURL;
  document.querySelector("#userAvatar").style.display = "inline-block";
  document.getElementById("loginStatus").innerHTML = `<span id="user">${displayName}</span> (<a style="color:white" href="#" onclick="signOut()">Sign Out</a>)`;

  const [{uid}] = providerData;

  app.uid = uid;
  app.userSignedIn = true;
  app.userDisplayName = displayName?displayName:((await BWData.fetchUserInfoFromGitHub(uid)).login);
  app.userPicture = photoURL;

  document.querySelectorAll("text.name").forEach((el) => {
    if(el.textContent === displayName) {
      el.parentElement.querySelector("circle").classList.add("logged");
    }
  });
};

export const logoutUser = () => {
  app.userSignedIn = false;
  app.uid = null;
  app.userDisplayName = null;
  app.userGitHubName = null;
  app.userPicture = null;

  document.querySelector("#userAvatar").style.display = "none";
  document.querySelector("#userAvatar img").src = "";
  document.getElementById("loginStatus").innerHTML = `<a style="color:white" href="#" onclick="signIn()">Sign In</a>`;
  document.querySelectorAll(".logged").forEach((el) => { el.classList.remove("logged"); });
};

const findPeopleBySkills = (filterSkills) => {
  const people = BWData.filterPeople({
    people: app.people,
    filterSkills
  });

  return people;
};

const showPeopleBySkills = (filterSkills) => {
  console.log(filterSkills);
  const filteredPeople = findPeopleBySkills(filterSkills).map((p) => p.displayname);
  window.updateNetwork(filteredPeople);
};


export const init = ({appSel, circleName, updateUserFn}) => {
  Quasar.Dark.set(true);

  app = new Vue({
    el: appSel,
    data () {
      return {
        people: [], // all people in the network
        skills: [], // all available skills

        spinning: true,
        uid: null,
        userDisplayName: null,
        userGitHubName: null,
        userPicture: null,

        displayCard: false,
        displaySignIn: false,
        cardDisplayName: "",
        cardGitHubName: "",
        cardUID: "",
        cardSkills: [],

        search: "",
        searchItems: [],
        searchOptions: []
      };
    },
    computed: {
      cardImgSrc: function () {
        return `https://avatars3.githubusercontent.com/u/${this.cardUID}?v=4`;
      },
      cardGitHubURL: function () {
        return `https://github.com/${this.cardGitHubName}`;
      }
    },
    methods: {
      filterFn (val, update) {
        update(() => {
          const needle = val.trim().toLowerCase();
          this.options = app.skills.filter((v) => v.trim().toLowerCase()
            .indexOf(needle) > -1);
        });
      },
      createValue (val, done) {
        app.skills.push(val);
        done(val);
      },
      updateUser() {
        // app.spinning = true;
        peopleArrToDatabaseDic({
          uid: app.uid,
          circleName,
          updateUserFn
        });
      },
      goTo (url) {
        window.location = url;
      },

      /**
       * Function called everytime a key is pressed in the search field
       * @param {string} val Characters typed thus far
       * @param {function} update Function called to update the options
       * @returns {void}
       */
      searchFn (val, update) {
        update(() => {
          const needle = val.trim().toLowerCase();
          const options = app.skills.filter((v) => v.trim().toLowerCase()
            .indexOf(needle) > -1).map((s) => s.trim());
          const uniqueOptions = [];
          for(const op of options) {
            if(!uniqueOptions.map((o) => o.trim().toLowerCase()).includes(op.toLowerCase())) {
              uniqueOptions.push(op);
            }
          }
          this.searchOptions = uniqueOptions;
        });
      },

      /**
       * Function called when a new skill is entered in the search field
       * @param {array} filterSkills Array of skills entered in the search field
       * @returns {void}
       */
      searchAdd (filterSkills) {
        showPeopleBySkills(filterSkills);
      }
    }
  });
};

window.saveSkills = () => {
  const text = JSON.stringify(app.skills, null, 2);
  const elem = document.createElement("a");
  elem.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  elem.setAttribute("download", "skills.json");
  elem.click();
};

window.savePeople = () => {
  const text = JSON.stringify(app.people, null, 2);
  const elem = document.createElement("a");
  elem.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  elem.setAttribute("download", "people.json");
  elem.click();
};
