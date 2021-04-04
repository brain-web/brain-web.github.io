/* global $, JitsiMeetJS */

// const options = {
//   hosts: {
//     domain: 'meet.jit.si',
//     muc: 'conference.meet.jit.si'
//   },
//   // bosh: '//jitsi-meet.example.com/http-bind', // FIXME: use xep-0156 for that
//   // The name of client node advertised in XEP-0115 'c' stanza
//   clientNode: 'http://jitsi.org/jitsimeet'
// };

let connection = null;
let isJoined = false;
let room = null;
let localTracks = [];
const remoteTracks = {};
let isVideo = true;
const initOptions = {
  disableAudioLevels: true
};
const confOptions = {
  openBridgeChannel: true
};

let roomName;
const jitsiURL = 'meet.jit.si'; // could be 'beta.meet.jit.si'

var subdomain = '';
if (subdomain) {
  subdomain = subdomain.substr(0,subdomain.length-1).split('.').join('_').toLowerCase() + '.';
}

/**
 * Handles local tracks.
 * @param tracks Array with JitsiTrack objects
 */
function onLocalTracks(tracks) {
  localTracks = tracks;
  for (let i = 0; i < localTracks.length; i++) {
    localTracks[i].addEventListener(
      JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
      audioLevel => console.log(`Audio Level local: ${audioLevel}`)
    );
    localTracks[i].addEventListener(
      JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
      () => console.log('local track muted')
    );
    localTracks[i].addEventListener(
      JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
      () => console.log('local track stoped')
    );
    localTracks[i].addEventListener(
      JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
      deviceId => console.log(`track audio output device was changed to ${deviceId}`)
    );
    if (localTracks[i].getType() === 'video') {
      $('#video-bubbles').append(`<div class="frame"><div class="video"><video autoplay='1' id='localVideo${i}' /></div></div>`);
      localTracks[i].attach($(`#localVideo${i}`)[0]);
    } else {
      $('#video-bubbles').append(`<audio autoplay='1' muted='true' id='localAudio${i}' />`);
      localTracks[i].attach($(`#localAudio${i}`)[0]);
    }
    if (isJoined) {
      room.addTrack(localTracks[i]);
    }
  }
}

/**
 * Handles remote tracks
 * @param track JitsiTrack object
 */
function onRemoteTrack(track) {
  if (track.isLocal()) {
    return;
  }
  const participant = track.getParticipantId();
  const trackType = track.getType();

  if (!remoteTracks[participant]) {
    remoteTracks[participant] = [];
  }

  const idx = remoteTracks[participant].push(track);

  track.addEventListener(
    JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
    audioLevel => console.log(`Audio Level remote: ${audioLevel}`)
  );
  track.addEventListener(
    JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
    () => console.log('remote track muted')
  );
  track.addEventListener(
    JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
    () => console.log('remote track stoped')
  );
  track.addEventListener(JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
    deviceId => console.log(`track audio output device was changed to ${deviceId}`)
  );
  const id = `${track.getType()}-${participant}`; //-${idx}`;

  const el = document.querySelector(`#${id}`);
  if (trackType === 'video') {
    if(el === null) {
      $('#video-bubbles').append(`<div class="frame"><div class="video"><video autoplay='1' id='${id}' /></div></div>`);
    }
  } else {
    if(el === null) {
      $('#video-bubbles').append(`<audio autoplay='1' id='${id}' />`);
    }
  }
  track.attach($(`#${id}`)[0]);
}

/**
 * That function is executed when the conference is joined
 */
function onConferenceJoined() {
  console.log('conference joined!');
  isJoined = true;
  for (let i = 0; i < localTracks.length; i++) {
    room.addTrack(localTracks[i]);
  }
}

/**
 *
 * @param id
 */
function onUserLeft(id) {
  console.log('user left');
  if (!remoteTracks[id]) {
    return;
  }
  const tracks = remoteTracks[id];

  for (let i = 0; i < tracks.length; i++) {
    const trackType = tracks[i].type; //tracks[i].getType();
    const idtag = `${trackType}-${id}`;
    let el = document.querySelector(`#${idtag}`);
    if(trackType === 'video') {
      el.parentElement.parentElement.remove();
    } else {
      el.remove();
    }
    tracks[i].detach(el);
  }
}

/**
 * That function is called when connection is established successfully
 */
function onConnectionSuccess() {
  room = connection.initJitsiConference(roomName, confOptions);
  room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
  room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, track => {
    console.log(`track removed!!!${track}`);
  });

  room.on(
    JitsiMeetJS.events.conference.CONFERENCE_JOINED,
    onConferenceJoined);
  room.on(JitsiMeetJS.events.conference.USER_JOINED, id => {
    console.log('user join');
    remoteTracks[id] = [];
  });
  room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
  room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, track => {
    console.log(`${track.getType()} - ${track.isMuted()}`);
  });
  room.on(
    JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED,
    (userID, displayName) => console.log(`${userID} - ${displayName}`)
  );
  room.on(
    JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
    (userID, audioLevel) => console.log(`${userID} - ${audioLevel}`)
  );
  room.on(
    JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED,
    () => console.log(`${room.getPhoneNumber()} - ${room.getPhonePin()}`)
  );
  room.join();
}

/**
 * This function is called when the connection fail.
 */
function onConnectionFailed() {
  console.error('Connection Failed!');
}

/**
 * This function is called when the connection fail.
 */
function onDeviceListChanged(devices) {
  console.info('current devices', devices);
}

/**
 * This function is called when we disconnect.
 */
function disconnect() {
  console.log('disconnect!');
  connection.removeEventListener(
    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
    onConnectionSuccess
  );
  connection.removeEventListener(
    JitsiMeetJS.events.connection.CONNECTION_FAILED,
    onConnectionFailed
  );
  connection.removeEventListener(
    JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
    disconnect
  );
}

/**
 *
 */
function unload() {
  for (let i = 0; i < localTracks.length; i++) {
      localTracks[i].dispose();
  }
  room.leave();
  connection.disconnect();
}

/**
 *
 */
function switchVideo() { // eslint-disable-line no-unused-vars
  isVideo = !isVideo;
  if (localTracks[1]) {
    localTracks[1].dispose();
    localTracks.pop();
  }
  JitsiMeetJS.createLocalTracks({
    devices: [ isVideo ? 'video' : 'desktop' ]
  })
  .then(tracks => {
    localTracks.push(tracks[0]);
    localTracks[1].addEventListener(
        JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
        () => console.log('local track muted'));
    localTracks[1].addEventListener(
        JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
        () => console.log('local track stoped'));
    localTracks[1].attach($('#localVideo1')[0]);
    room.addTrack(localTracks[1]);
  })
  .catch(error => console.log(error));
}

/**
 *
 * @param selected
 */
function changeAudioOutput(selected) { // eslint-disable-line no-unused-vars
  JitsiMeetJS.mediaDevices.setAudioOutputDevice(selected.value);
}

function initVideoBubbles(myRoomName) {
  roomName = myRoomName;
  const options = {
    hosts: {
      domain: jitsiURL,
      muc: 'conference.' + subdomain + jitsiURL, // FIXME: use XEP-0030
      focus: 'focus.' + jitsiURL,
    },
    externalConnectUrl: 'https://meet.jit.si/http-pre-bind', // IS THIS REQUIRED?
    disableSimulcast: false,
    enableRemb: true,
    enableTcc: true,
    resolution: 720,
    constraints: {
      video: {
        height: {
          ideal: 720,
          max: 720,
          min: 180
        },
        width: {
          ideal: 720,
          max: 720,
          min: 320
        }
      }
    },
    analytics: {
      amplitudeAPPKey: "5ec3ac3a3c26e8b51af620cf26e75758",
      rtcstatsEnabled: false ,
      rtcstatsEndpoint: "wss://rtcstats-server.jitsi.net/",
      rtcstatsPollInterval: 2000,
      whiteListedEvents: [ 'conference.joined', 'conference.left', 'page.reload.scheduled', 'rejoined', 'transport.stats' ],
    },
    enableP2P: true, // flag to control P2P connections
    // New P2P options
    p2p: {
      enabled: true,
      preferredCodec: 'h264',
      preferH264: true,
      disableH264: true,
      useStunTurn: true // use XEP-0215 to fetch STUN and TURN servers for the P2P connection
    },
    useStunTurn: true, // use XEP-0215 to fetch TURN servers for the JVB connection
    useTurnUdp: true,
    serviceUrl: '//' + jitsiURL + '/http-bind?room=' + roomName,
    // bosh: '//' + jitsiURL + '/http-bind?room=' + roomName, // FIXME: use xep-0156 for that
    // websocket: 'wss://' + jitsiURL + '/xmpp-websocket', // FIXME: use xep-0156 for that
    clientNode: 'http://jitsi.org/jitsimeet', // The name of client node advertised in XEP-0115 'c' stanza
    
    //deprecated desktop sharing settings, included only because older version of jitsi-meet require them
    desktopSharing: 'ext', // Desktop sharing method. Can be set to 'ext', 'webrtc' or false to disable.
    chromeExtensionId: 'kglhbbefdnlheedjiejgomgmfplipfeb', // Id of desktop streamer Chrome extension
    desktopSharingSources: ['screen', 'window'],
    enableCalendarIntegration: true,
    
    //new desktop sharing settings
    desktopSharingChromeExtId: 'kglhbbefdnlheedjiejgomgmfplipfeb', // Id of desktop streamer Chrome extension
    desktopSharingChromeSources: ['screen', 'window', 'tab'],
    useRoomAsSharedDocumentName: false,
    enableLipSync: false,
    disableRtx: false, // Enables RTX everywhere
    enableScreenshotCapture: false,
    openBridgeChannel: 'websocket', // One of true, 'datachannel', or 'websocket'
    channelLastN: 20, // The default value of the channel attribute last-n.
    lastNLimits: {
      5: 20,
      30: 15,
      50: 10,
      70: 5,
      90: 2
    },
    videoQuality: {
      maxBitratesVideo: {
        low: 200000,
        standard: 500000,
        high: 1500000
      },
    },
    startBitrate: "800",
    disableAudioLevels: false,
    disableSuspendVideo: true,
    stereo: false,
    forceJVB121Ratio:  -1,
    enableTalkWhileMuted: true,
    enableNoAudioDetection: true,
    enableNoisyMicDetection: true,
    enableOpusRed: true,
    enableClosePage: true,
    disableLocalVideoFlip: false,
    hiddenDomain: 'recorder.' + jitsiURL,
    longTasksStatsInterval: 10000,
    transcribingEnabled: true,
    enableRecording: true,
    liveStreamingEnabled: true,
    fileRecordingsEnabled: true,
    fileRecordingsServiceEnabled: false,
    fileRecordingsServiceSharingEnabled: false,
    requireDisplayName: false,
    enableWelcomePage: true,
    isBrand: false,
  
    // To enable sending statistics to callstats.io you should provide Applicaiton ID and Secret.
    callStatsID: "549114654", //Application ID for callstats.io API
    callStatsSecret: "teSaRC3EjkMe:OR5A7uDh06AhIg287rbyA5jyzDg=", //Secret for callstats.io API
    callStatsCustomScriptUrl: "https://api.callstats.io/static/callstats-ws.min.js",
    dialInNumbersUrl: 'https://web-cdn.jitsi.net/beta/phoneNumberList.json',
    dialInConfCodeUrl:  'https://api.jitsi.net/conferenceMapper',
    dialOutCodesUrl:  'https://api.jitsi.net/countrycodes',
    dialOutAuthUrl: 'https://api.jitsi.net/authorizephone',
    peopleSearchUrl: 'https://api.jitsi.net/directorySearch',
    inviteServiceUrl: 'https://api.jitsi.net/conferenceInvite',
    inviteServiceCallFlowsUrl: 'https://api.jitsi.net/conferenceinvitecallflows',
    peopleSearchQueryTypes: ['user','conferenceRooms'],
    startAudioMuted: 9,
    startVideoMuted: 9,
    enableUserRolesBasedOnToken: false,
    enableLayerSuspension: true,
    feedbackPercentage: 100,
    prejoinPageEnabled: true,
    moderatedRoomServiceUrl: 'https://moderated.jitsi.net',
    enableInsecureRoomNameWarning: true,
    hepopAnalyticsUrl: "",
    hepopAnalyticsEvent: {
      product: "lib-jitsi-meet",
      subproduct: "beta-meet-jit-si",
      name: "jitsi.page.load.failed",
      action: "page.load.failed",
      actionSubject: "page.load",
      type: "page.load.failed",
      source: "page.load",
      attributes: {
        type: "operational",
        source: 'page.load'
      },
      server: jitsiURL
    },
    deploymentInfo: {
      environment: 'beta-meet-jit-si',
      envType: 'stage',
      releaseNumber: '1071',
      shard: 'beta-eu-west-2b-s3',
      region: 'eu-west-2',
      userRegion: 'eu-west-2',
      crossRegion: (!'eu-west-2' || 'eu-west-2' === 'eu-west-2') ? 0 : 1
    },
    e2eping: {
      pingInterval: -1
    },
    abTesting: {},
    testing: {
      capScreenshareBitrate: 1,
      octo: {
        probability: 1
      }
    }
  };

  $(window).bind('beforeunload', unload);
  $(window).bind('unload', unload);

  JitsiMeetJS.init(initOptions);

  connection = new JitsiMeetJS.JitsiConnection(null, null, options);
  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
    onConnectionSuccess
  );
  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_FAILED,
    onConnectionFailed
  );
  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
    disconnect
  );
  JitsiMeetJS.mediaDevices.addEventListener(
    JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED,
    onDeviceListChanged
  );
  connection.connect();

  JitsiMeetJS.createLocalTracks({ devices: [ 'audio', 'video' ] })
  .then(onLocalTracks)
  .catch(error => {
    throw error;
  });

  if (JitsiMeetJS.mediaDevices.isDeviceChangeAvailable('output')) {
    JitsiMeetJS.mediaDevices.enumerateDevices(devices => {
      const audioOutputDevices = devices.filter(d => d.kind === 'audiooutput');
      if (audioOutputDevices.length > 1) {
        $('#audioOutputSelect').html(
          audioOutputDevices
            .map(d => `<option value="${d.deviceId}">${d.label}</option>`)
            .join('\n')
        );
        $('#audioOutputSelectWrapper').show();
      }
    });
  }
}