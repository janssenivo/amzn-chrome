// fetch AMZN stock price and display as badge

const YAHOO_API_KEY = ''; // put your own key here
const SYMBOL = 'AMZN'
const INTERVAL = 30

chrome.runtime.onInstalled.addListener(() => {
  updateBadge('init...');
  updateBadgeWithStockprice();
  chrome.alarms.create({ periodInMinutes: INTERVAL, delayInMinutes: INTERVAL});
  console.log('Init complete');
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

function updateBadgeWithStockprice() {
  const url = 'https://yh-finance.p.rapidapi.com/market/v2/get-quotes?region=US&symbols='+SYMBOL;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com',
      'X-RapidAPI-Key': YAHOO_API_KEY
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
      let tooltip = SYMBOL+" $"+price.toFixed(2)+" ("+change.toFixed(2)+", "+changePercent.toFixed(2)+"%)";
      //console.log(price);
      if (price >= prevClose) {
        updateBadge(price.toFixed(0), tooltip, "blue")
      } else {
        updateBadge(price.toFixed(0), tooltip, "red")
      }
    })
    .catch(err => console.error('error:' + err));
};

function updateBadge(text="", tooltip=SYMBOL, color="gray") {
  chrome.action.setBadgeText({text: text});
  chrome.action.setBadgeBackgroundColor({color: color});
  chrome.action.setTitle({title: tooltip})
  console.log('Badge updated to '+text+' at '+new Date);    
};