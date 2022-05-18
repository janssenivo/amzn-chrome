// fetch AMZN stock price and display as badge

let settings = {}; // persistent Chrome-sync storage for settings

chrome.runtime.onInstalled.addListener(async () => {
  updateBadge('init...');
  // load settings
  await initStorageCache;
  settings.interval=parseInt(settings['interval']); // need int for this field
  console.log ("settings loaded: "+JSON.stringify(settings));

  // initial price
  updateBadgeWithStockprice();
  
  // set recurring event to update
  chrome.alarms.create({ periodInMinutes: settings['interval'], delayInMinutes: settings['interval'] });
  console.log('Init complete, will refresh '+settings['symbol']+' quote every '+settings['interval']+' minutes.');
});

chrome.action.onClicked.addListener(() => { 
  console.log('Icon clicked');
  updateBadge('');
  updateBadgeWithStockprice();
});

chrome.alarms.onAlarm.addListener(() => {
  console.log('Alarm triggered')
  updateBadge('');
  updateBadgeWithStockprice();
});

// Reads all data out of storage.sync and exposes it via a promise.
const initStorageCache = loadOptions().then(items => {
  Object.assign(settings, items);
});
function loadOptions() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(null, (items) => {
      if (chrome.runtime.lastError) { return reject(chrome.runtime.lastError); }
      resolve(items);
    });
  });
}

// Make call to Yahoo Finance API via Rapid API
function updateBadgeWithStockprice() {
  const url = 'https://yh-finance.p.rapidapi.com/market/v2/get-quotes?region=US&symbols='+settings['symbol'];
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com',
      'X-RapidAPI-Key': settings['apikey']
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
      let tooltip = settings['symbol']+" $"+price.toFixed(2)+" ("+change.toFixed(2)+", "+changePercent.toFixed(2)+"%)";
      //console.log(price);
      if (price >= prevClose) {
        updateBadge(price.toFixed(0), tooltip, "blue")
      } else {
        updateBadge(price.toFixed(0), tooltip, "red")
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
