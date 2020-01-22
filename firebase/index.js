const firebase = require("firebase");
require("firebase/firestore");

const https = require("https");

firebase.initializeApp({
  apiKey: "AIzaSyAVfYDNFFu-sVQypcpY0rJkQv-LQoES_0Y",
  authDomain: "q-siemens.firebaseapp.com",
  databaseURL: "https://q-siemens.firebaseio.com",
  projectId: "q-siemens",
  storageBucket: "q-siemens.appspot.com",
  messagingSenderId: "1043837308530",
  appId: "1:1043837308530:web:da75bf5ea251c4b4"
});

const db = firebase.firestore();

function getToken() {
  return fetch("https://api.qnips.com/cons/api/FirebaseCustomToken", {
    credentials: "include",
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "de-DE",
      "app-brand": "siemens",
      authorization:
        "usr=catering-portal@qnips.io&pwd=49a9113c3d7ef209a176b7629ae0553b",
      "cache-control": "no-cache",
      pragma: "no-cache",
      "response-version": "v2",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site"
    },
    referrerPolicy: "no-referrer-when-downgrade",
    body: null,
    method: "GET",
    mode: "cors"
  })
    .then(body => body.json())
    .then(res => res.CustomToken);
}

const STORE_ID_BS = 24900;
const MENU_CARD_ID_BS = 11648;

const FIREBASE = {
  languagesCollection() {
    return db.collection(`${ENVIRONMENT}`).get();
  },
  menuDoc(card, year, week) {
    return db.doc(
      `${ENVIRONMENT}/${LANGUAGE}/Menus/${card}/Years/${year}/Weeks/${week}`
    );
  },
  storeCollection() {
    return db.collection(`${ENVIRONMENT}/${LANGUAGE}/Stores`);
  },
  storeDoc(id) {
    return db.doc(`${ENVIRONMENT}/${LANGUAGE}/Stores/${id}`);
  },
  trackingZonesOfStoreCollection(id) {
    return db.collection(`${ENVIRONMENT}/invariant/Stores/${id}/TrackingZones`);
  },
  contentItemCollection() {
    return db.collection(`${ENVIRONMENT}/${LANGUAGE}/ContentItems`);
  },
  storesContentItemCollection(id) {
    return db.collection(
      `${ENVIRONMENT}/${LANGUAGE}/Stores/${id}/ContentItems`
    );
  },
  tagCollection() {
    return db.collection(`${ENVIRONMENT}/${LANGUAGE}/Tags`);
  }
};

getToken().then(token => {
  firebase
    .auth()
    .signInWithCustomToken(token)
    .then(() => {
      FIREBASE.storeDoc(STORE_ID_BS)
        .get()
        .then(doc => console.log(doc.data()));
    });
});

function printMenu() {
  FIREBASE.menuDoc(MENU_CARD_ID_BS, 2020, 4)
    .get()
    .then(doc => {
      const days = doc.data().Days;
      const data = days.map(day => ({
        date: new Date(day.Date.seconds * 1000).toISOString(),
        meals: day.Categories.map(c => ({
          category: c.Name,
          name: c.Products[0].Name,
          prices: c.Products[0].Prices.map(p => ({
            price: p.Price,
            tag: p.Tag
          }))
        }))
      }));
      console.log(JSON.stringify(data, null, 2));
    });
}

function printStores() {
  db.collection("Release/de-DE/Stores")
    .get()
    .then(querySnapshot => {
      console.log(`got ${querySnapshot.length} documents`);
      querySnapshot.forEach(doc =>
        console.log(`${doc.id} => ${doc.data().LoyaltyProgramName}`)
      );
    })
    .catch(err => console.error(err));
}

const ENVIRONMENT = "Release";
const LANGUAGE = "de-DE";
