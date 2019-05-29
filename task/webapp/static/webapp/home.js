(function() {

  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyB8S59bFxl5mFPPsNR856RYAuaClWBBweE",
    authDomain: "webbapp-task.firebaseapp.com",
    databaseURL: "https://webbapp-task.firebaseio.com",
    projectId: "webbapp-task",
    storageBucket: "webbapp-task.appspot.com",
    messagingSenderId: "735906632195",
    appId: "1:735906632195:web:fd720c1c76c2a8a5"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const infoDiv = document.getElementById('info')
  const divIn = document.getElementById('list')

  const dbRefObj = firebase.database().ref().child('webbapp-task')
  const dbRefList = dbRefObj.child('info')

  dbRefObj.on('value', snap => {
    infoDiv.innerText = JSON.stringify(snap.val(), null, 3);
  });

  dbRefList.on('child_added', snap => {
    const div = document.createElement('div')
    div.innerText = snap.val()
    divIn.appendChild(div)

  });

  dbRefList.on('child_changed', snap => {
    
    const divChanged = document.getElementById(snap.key);
    divChanged.innerText = snap.val();

  });

  dbRefList.on('child_removed', snap => {
    
    const divRemove = document.getElementById(snap.key);
    divRemove.remove();

  });

}());