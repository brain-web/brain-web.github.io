var subdomain = "";
if (subdomain) {
    subdomain = subdomain.substr(0,subdomain.length-1).split('.').join('_').toLowerCase() + '.';
}
var config = {
    hosts: {
        domain: 'beta.meet.jit.si',

        muc: 'conference.'+subdomain+'beta.meet.jit.si', // FIXME: use XEP-0030
        focus: 'focus.beta.meet.jit.si',
    },
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
                ideal: 1280,
                max: 1280,
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
        disableH264: false,
        useStunTurn: true // use XEP-0215 to fetch STUN and TURN servers for the P2P connection
    },
    useStunTurn: true, // use XEP-0215 to fetch TURN servers for the JVB connection
    useTurnUdp: true,
    bosh: '//beta.meet.jit.si/http-bind', // FIXME: use xep-0156 for that
    websocket: 'wss://beta.meet.jit.si/xmpp-websocket', // FIXME: use xep-0156 for that


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

    hiddenDomain: 'recorder.beta.meet.jit.si',

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
    callStatsID: "549114654",//Application ID for callstats.io API
    callStatsSecret: "teSaRC3EjkMe:OR5A7uDh06AhIg287rbyA5jyzDg=",//Secret for callstats.io API
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
        server: "beta.meet.jit.si"
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
    abTesting: {
    },
    testing: {
            capScreenshareBitrate: 1,
        octo: {
            probability: 1
        }
    }
};
