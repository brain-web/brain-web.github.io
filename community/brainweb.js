import * as BWData from "./brainweb-data.js";
import * as BWFirebase from "./brainweb-firebase.js";
import * as BWGraph from "./brainweb-graph.js";
import * as BWUI from "./brainweb-ui.js";

export const data = {
  appSel: null,
  networkSel: null,
  circleName: null,
  circleSkill: null,
  filterSkills: null
};

const dataReceived = async (circle) => {
  BWUI.databaseDicToPeopleArr(circle);

  await BWUI.addCurrentUser({
    circleName: data.circleName,
    circleSkill: data.circleSkill,
    updateUserFn: BWFirebase.updateUser
  });

  const filteredPeople = BWData.filterPeople({
    people: BWUI.getAttribute("people"),
    filterSkills: data.filterSkills
  });

  if(typeof filteredPeople === "undefined") {
    console.log("No people left after filtering");
    BWUI.setAttributes({spinning: false});

    return;
  }

  if(filteredPeople.length < 15) {
    console.log("Graph too small to proceed", filteredPeople.length);
    BWUI.setAttributes({spinning: false});

    return;
  }

  await BWGraph.addBrainWebToElement({
    sel: data.networkSel,
    people: filteredPeople,
    userDisplayName: BWUI.getAttribute("userDisplayName"),
    userClickFn: (user) => { BWUI.displayUserCard(filteredPeople[user.index]); }
  });

  BWUI.setAttributes({spinning: false});
};

export const init = (params) => {
  data.appSel = params.appSel;
  data.networkSel = params.networkSel;
  data.circleName = params.circleName;
  data.circleSkill = params.circleSkill;
  data.filterSkills = params.filterSkills;

  BWUI.init({
    appSel: params.appSel,
    circleName: params.circleName,
    updateUserFn: BWFirebase.updateUser
  });

  BWFirebase.init({
    BWData,
    dataReceivedFn: dataReceived
  });

  // eslint-disable-next-line no-undef
  startFirebase();

  window.addEventListener('load', () => {
    // eslint-disable-next-line no-undef
    initApp({
      loginUserFn: BWUI.loginUser,
      logoutUserFn: BWUI.logoutUser
    });
    BWFirebase.listen(data);
  });
};
