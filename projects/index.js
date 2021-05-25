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

const _getDataFromMd = (text) => {
  const regexImage = /\((http[s]*:[^\) ]+.(gif|jpg|jpeg|png|tif|tiff))\)/i;
  const regexMattermost = /https:\/\/mattermost.brainhack.org\/brainhack\/channels\/([^"\)]+)/;
  const arrImage = text.match(regexImage);
  const arrMattermost = text.match(regexMattermost);
  let image, mattermost;
  if(arrImage !== null && arrImage[1] !== null) {
    [, image] = arrImage;
  }
  if(arrMattermost !== null && arrMattermost[1] !== null) {
    [, mattermost] = arrMattermost;
  }

  return {image, mattermost};
};

const getDataFromMd = async (url) => {
  var pr = new Promise((resolve) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send(null);
    xhr.onreadystatechange = function () {
      var DONE = 4; // readyState 4 means the request is done.
      var OK = 200; // status 200 is a successful return.
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
          const response = _getDataFromMd(xhr.responseText);
          resolve(response);
        } else {
          // console.log('Error: ' + xhr.status); // An error occurred during the request.
          resolve(null);
        }
      }
    };
  });

  return pr;
};

const getDataFromReadme = async (repoURL) => {
  const url = repoURL.replace("https://github.com/", "https://raw.githubusercontent.com/") + "/master";
  let result;
  result = await getDataFromMd(url + '/README.md');
  if(result === null) {
    result = await getDataFromMd(url + '/ReadMe.md');
  } else if(result === null) {
    result = await getDataFromMd(url + '/readme.md');
  } else if(result === null) {
    result = await getDataFromMd(url + '/Readme.md');
  }

  return result;
};

const getRepoList = async () => {
  const defaultImages = [
    "https://generative-placeholders.glitch.me/image?width=300&height=200&style=triangles",
    "https://generative-placeholders.glitch.me/image?width=300&height=200"
  ];
  let res, response;
  try {
    response = await fetch('https://api.github.com/search/repositories?q=topic:brainweb fork:true');
    res = await response.json();
  } catch (err) {
    throw new Error(err);
  }
  for(const repo of res.items) {
    (async (aRepo) => {
      const {
        name,
        description,
        html_url,
        open_issues,
        stargazers_count,
        language,
        homepage
      } = aRepo;
      let res2;
      try {
        res2 = await getDataFromReadme(html_url);
      } catch (err) {
        throw new Error(err);
      }
      const {image, mattermost} = res2;
      app.projects.push({
        imgSrc:(image)?image:defaultImages[Math.round(defaultImages.length*Math.random())],
        projectName: name,
        projectDescription: description,
        projectURL: html_url,
        projectInfo: {description, html_url, open_issues, stargazers_count, language, homepage},
        projectMattermost: mattermost
      });
    })(repo);
  }
};
getRepoList();

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
