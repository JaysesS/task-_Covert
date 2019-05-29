function init(){

    // Init firebase
    config = {
      "apiKey": "AIzaSyB8S59bFxl5mFPPsNR856RYAuaClWBBweE",
      "authDomain": "webbapp-task.firebaseapp.com",
      "databaseURL": "https://webbapp-task.firebaseio.com",
      "storageBucket": "webbapp-task.appspot.com",
    }

    firebase.initializeApp(config)

    window.onload = function(){

        // Listeners of changes in the database

        const divIn = document.getElementById('list')
        const dbRefObj = firebase.database().ref()
        const dbRefList = dbRefObj.child('info')

        dbRefList.on('child_added', snap => {

            const div = document.createElement('div')
            div.setAttribute("id", snap.key)
            div.innerHTML = changeNameForData(snap.key) + " : <font color=\"green\">" + snap.val() + "</font>";
            divIn.appendChild(div)

        });

        dbRefList.on('child_changed', snap => {
        
            const divChanged = document.getElementById(snap.key);
            divChanged.innerHTML = changeNameForData(snap.key) + " : <font color=\"green\">" + snap.val() + "</font>";

        });

        dbRefList.on('child_removed', snap => {
        
            const divRemove = document.getElementById(snap.key);
            divRemove.remove();

        });

        // Drawing graphs on the history of database

        getHistory("priceUsd").then((data)=>{
          printChart(data, "priceUsd", "BCH PRICE")
        })

        getHistory("mempoolTransactions").then((data)=>{
          printChart(data, "mempoolTransactions", "BCH MEMPOOL TRANSACTIONS")
        })

        getHistory("priceUsdChange").then((data)=>{
          printChart(data, "priceUsdChange", "BCH USD CHANGE")
        })

        getHistory("transactionFeeUsd").then((data)=>{
          printChart(data, "transactionFeeUsd", "BCH TRANSACTION FEE USD")
        })

        getHistory("transactions").then((data)=>{
          printChart(data, "transactions", "BCH TRANSACTION")
        })

        getHistory("transactions24").then((data)=>{
          printChart(data, "transactions24", "BCH TRANSACTION FOR 24h")
        })

        getHistory("volume").then((data)=>{
          printChart(data, "volume", "BCH VOLUME")
        })
        
        // Check on hardfork
        
        let idSetInterval = setInterval((arg) => {
          if (checkHardFork() == -1){
            clearInterval(idSetInterval);
            const infoDiv = document.getElementById('infoToHardFork')
            const infoAboutStatusMonitoringDiv = document.getElementById('infoAboutStatusMonitoring')
            infoDiv.innerHTML = "<h1>Hardfork!</h1>"
            var symbol = '\u2718';
            infoAboutStatusMonitoringDiv.innerHTML = "Online monitoring " + symbol
          }
        }, 1000);

    };
}

// Changing the name to display online data correctly
function changeNameForData(name){
  if (name === "mempoolTransactions"){
    return "MEMPOOL TRANSACTIONS"
  }

  if (name === "priceUsd"){
    return "PRICE USD"
  }

  if (name === "priceUsdChange"){
    return "PRICE USD CHANGE"
  }

  if (name === "transactionFeeUsd"){
    return "TRANSACTION FREE USD"
  }

  if (name === "transactions"){
    return "TRANSACTIONS"
  }

  if (name === "transactions24"){
    return "TRANSACTIONS FOR 24h"
  }

  if (name === "volume"){
    return "VOLUME"
  }
}

// Timestamp in default data
function convertTime(timestamp){
  return new Date(timestamp * 1000).toISOString().slice(0, 19).replace('T', ' ')
}

// Getting history from the database to draw charts on it
function getHistory(tag){
  return new Promise(function(resolve){

    const divIn = document.getElementById('charts')
    const div = document.createElement('div')
    div.setAttribute("style", "border:1px solid #ccc; width:550px;height:370px;padding:5px;margin: 5px;")
    div.innerHTML = "<canvas id=\"Chart" + ucFirst(tag) + "\" width=\"550\" height=\"370\"></canvas>";
    divIn.appendChild(div)

    var data = {time:[]}
    data[tag] = []
    const dbRefObj = firebase.database().ref().child('history')
    dbRefObj.on('value', function(snapshot) {
          var object = snapshot.val()
          var unixTimeArray = Object.keys(object)
          unixTimeArray.forEach(function (unixTime, i){
              data[tag].push(object[unixTime][tag])
              data.time.push(convertTime(unixTime))
              if (i === unixTimeArray.length -1){
                resolve(data)
              }
          })
    });
  })
}

// Drawing chart
function printChart(data, tag, title){
  
  var dates = data.time
  var config = {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        pointRadius : 0,
        label: title,
        data: data[tag],
        fill: true,
        backgroundColor: "rgba(54, 169, 17, 0.7)",
        borderColor: "black",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: title
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      scales: {
        xAxes: [{
          display: false,
          scaleLabel: {
            display: true,
            labelString: 'Time',
            fontColor: "green"
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
          }
        }]
      },
      legend: {
        display: false,
        labels: {
            fontColor: 'rgb(255, 99, 132)'
        }
    }
    }
  };
  var ctx = document.getElementById('Chart' + ucFirst(tag)).getContext('2d');
  window.myLine = new Chart(ctx, config);
}

// Method similar to str.capitalize() in python
function ucFirst(str) {
  if (!str) return str;
  return str[0].toUpperCase() + str.slice(1);
}

// Check for "hardfork"
function checkHardFork(){
  var endTime = getEndTime()
  const infoDiv = document.getElementById('infoToHardFork')
  const infoAboutStatusMonitoringDiv = document.getElementById('infoAboutStatusMonitoring')
  var timeTohardFork = endTime - parseInt(new Date().getTime()/1000)
  var symbol = '\u2714';
  if (!isNaN(timeTohardFork)){
      infoDiv.innerHTML = "<h1>Hardfork in " +  timeTohardFork + "</h1>"
      infoAboutStatusMonitoringDiv.innerHTML = "Online monitoring " + symbol
  } else {
      infoDiv.innerHTML = "<h1>Hardfork in .. </h1>"
      infoAboutStatusMonitoringDiv.innerHTML = "Online monitoring " + symbol
  }
  
  if (endTime <= parseInt(new Date().getTime()/1000)){
    return -1
  }
}

// Getting "hardfork" time from database
function getEndTime(){

  var endTime;
  const dbRefObj = firebase.database().ref()
  dbRefObj.on('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        if(childSnapshot.key === "time"){
            endTime = childSnapshot.val();
        }
      });
  });

  return endTime
}
