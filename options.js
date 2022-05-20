// Saves options to chrome.storage
function save_options() {
  var apikey = document.getElementById('apikey').value;
  var interval = document.getElementById('interval').value;
  var symbol = document.getElementById('symbol').value;

  chrome.storage.sync.set({
    apikey: apikey,
    interval: interval,
    symbol, symbol
  }, function() {
    // update status to let user know options were saved, close window after 3 seconds
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    chrome.runtime.reload();
    setTimeout(function() {
      window.close();
    }, 2500);
  });
}

// Restores state using the preferences stored in chrome.storage. with defaults
function restore_options() {
  chrome.storage.sync.get({
    apikey: '',
    interval: 120,
    symbol: 'AMZN'
  }, function(items) {
    document.getElementById('apikey').value = items.apikey;
    document.getElementById('interval').value = items.interval;
    document.getElementById('symbol').value = items.symbol;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
