/**
 * BrainWeb Data module
 * Provides utility functions for converting among different data structures
 */

export const arr2dic = (arr) => {
  const dic = {};
  for(const item of arr) {
    const {uid} = item;
    dic[uid] = {};
    for(const key of Object.keys(item)) {
      if(key !== "uid") {
        dic[uid][key] = item[key];
      }
    }
  }

  return dic;
};

export const dic2arr = (dic) => {
  const arr = [];
  for(const uid of Object.keys(dic)) {
    const item = {uid};
    for(const key of Object.keys(dic[uid])) {
      if(key!==uid) {
        item[key] = dic[uid][key];
      }
    }
    arr.push(item);
  }

  return arr;
};

export const filterPeople = ({people, filterSkills}) => {
  // if there's no filterSkills, return the original array of people
  if (!filterSkills || filterSkills.length === 0) {

    return people;
  }

  const lowerCaseFilterSkills = filterSkills.map((ss) => ss.toLowerCase());
  const filteredPeople = people.filter((p) => (p.skills||[]).some((s) => lowerCaseFilterSkills.includes(s.toLowerCase())));

  return filteredPeople;
};

/**
 * fetch user information given the GitHub user id number
 * @param {string} uid Numeric GitHub user identifier
 * @returns {object} User information from GitHub
 */
export const fetchUserInfoFromGitHub = async (uid) => {
  let json, res;
  try {
    res = await fetch(`https://api.github.com/user/${uid}`);
    json = await res.json();
  } catch (err) {
    throw new Error(err);
  }

  return json;
};
