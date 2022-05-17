// fetch AMZN stock price and display as badge

const YAHOO_API_KEY = ''; // put your own key here

chrome.runtime.onInstalled.addListener(() => {
  updateBadge('init...');
  chrome.alarms.create({ periodInMinutes: 1, delayInMinutes: 1});
  updateBadgeWithStockprice();
  console.log('Init complete');
});

chrome.action.onClicked.addListener(() => { 
  console.log('Extension clicked');
  updateBadge('updating...');
  updateBadgeWithStockprice();
});

chrome.alarms.onAlarm.addListener(() => {
  console.log('Alarm triggered')
  updateBadgeWithStockprice();
});

function updateBadgeWithStockprice() {
  const url = 'https://yh-finance.p.rapidapi.com/market/v2/get-quotes?region=US&symbols=AMZN';
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
      let price = json.quoteResponse.result[0].regularMarketPrice.toFixed();
      //console.log(price);
      updateBadge(price)
    })
    .catch(err => console.error('error:' + err));
};

function updateBadge(text) {
  chrome.action.setBadgeText({text: text});
  console.log('Badge updated to '+text+' at '+new Date);    
};