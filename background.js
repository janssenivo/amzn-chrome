// fetch AMZN stock price and display as badge

let settings = {}; // persistent Chrome-sync storage for settings

chrome.runtime.onInstalled.addListener(async () => {
  console.log(insideTradingHours());
  updateBadge('init...');
  // load settings
  await initStorageCache;
  if (settings.interval===undefined) settings.interval="120" // undefined at first load
  settings.interval=parseInt(settings.interval); // need int for this field
  console.log ("settings loaded: "+JSON.stringify(settings));

  // initial price if we already have an apikey configured, otherwise show hint
  if (settings.apikey!==undefined) {
    updateBadgeWithStockprice();
  } else {
    updateBadge("apikey", "Please set API Key in extension options");
  }
  
  // set recurring event to update
  chrome.alarms.create({ periodInMinutes: settings.interval, delayInMinutes: settings.interval });
  console.log('Init complete, will refresh '+settings.symbol+' quote every '+settings.interval+' minutes.');
});

chrome.action.onClicked.addListener(() => { 
  console.log('Icon clicked');
  updateBadge('');
  updateBadgeWithStockprice();
});

chrome.alarms.onAlarm.addListener(() => {
  console.log('Alarm triggered')
  if (insideTradingHours()) { // cut down on unnecessary API calls
    updateBadge('');
    updateBadgeWithStockprice();
  } else {
    console.log("outside trading hours, won't trigger update");
  }
});

// Reads all data out of storage.sync
const initStorageCache = new Promise((resolve, reject) => {
  chrome.storage.sync.get(null, (items) => {
    if (chrome.runtime.lastError) {
      resolve({}); // ignore
    }
    resolve(items);
  });
}).then(items => {
    Object.assign(settings, items);
});

// Make call to YH Finance API via Rapid API
function updateBadgeWithStockprice() {
  const url = 'https://yh-finance.p.rapidapi.com/market/v2/get-quotes?region=US&symbols='+settings.symbol;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com',
      'X-RapidAPI-Key': settings.apikey
    }
  };
  
  fetch(url, options)
    .then(res => res.json())
    .then(json => {
      let stock = json.quoteResponse.result[0];
      let price = stock.regularMarketPrice;
      let prevClose = stock.regularMarketPreviousClose;
      let change = stock.regularMarketChange;
      let changePercent = stock.regularMarketChangePercent;
      let sign = (stock.regularMarketChange<0)?'-':'+';
      let tooltip = settings.symbol+" $"+price.toFixed(2)+" ("+sign
                  +"$"+Math.abs(change.toFixed(2))+", "
                  +sign+Math.abs(changePercent.toFixed(2))+"%)";
      //console.log(price);
      if (price >= prevClose) {
        updateBadge(price.toFixed(0), tooltip, "#4267B2")
      } else {
        updateBadge(price.toFixed(0), tooltip, "#C23030")
      }
    })
    .catch(err => {
      updateBadge("failed");
      console.error('error:' + err)
    });
};

function updateBadge(text="", tooltip="", color="gray") {
  chrome.action.setBadgeText({text: text});
  chrome.action.setBadgeBackgroundColor({color: color});
  chrome.action.setTitle({title: tooltip})
  console.log('Badge updated to '+text+' at '+new Date);    
}

// currently returns true for Mon-Fri 7am-5pm in US EDT (+0400)
function insideTradingHours() {
  var now = new Date;
  var nyc_hour = now.getUTCHours()-4;
  var nyc_weekday = now.getDay(); // TODO: race condition: localtz already in diff date
  var now_inside_trading_hours = 
    (nyc_hour > 7 && nyc_hour < 17 &&      // 7am-5pm
     nyc_weekday != 6 && nyc_weekday != 0) // not Sat or Sun
  return now_inside_trading_hours;
}