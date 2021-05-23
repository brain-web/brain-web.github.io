/* globals firebase Sentry */

const config = {
  dataReceivedFn: null
};

export const init = ({
  dataReceivedFn
}) => {
  config.dataReceivedFn = dataReceivedFn;
};

/**
 * Update user in the Firebase database
 * @param {object} databaseDic Database dictionary
 * @returns {void}
 */
export const updateUser = ({databaseDic, circleName, uid}) => {
  if(uid === null) {
    // config.BWData.data.spinning = false;
    return;
  }

  const str = databaseDic[uid];
  const obj = {};
  obj[uid] = str;
  firebase.database().ref(`circles/${circleName}`)
    .update(obj)
    .then(function() {
      // config.BWData.data.spinning = false;
      console.log('update: success');
    }, function(error) {
      // config.BWData.data.spinning = false;
      Sentry.captureException(error);
      console.log('update: error', error);
    });
};

export const listen = ({circleName}) => {
  var circles = firebase.database().ref(`circles/${circleName}`);
  circles.on('value', (s) => {
    var circle = s.val();
    if(circle === null) {
      return;
    }

    config.dataReceivedFn(circle);
  });
};
