console.log("background called")

chrome.runtime.onInstalled.addListener(function (object) {
    let externalUrl = "http://yoursite.com/";
    let internalUrl = chrome.runtime.getURL("views/onboarding.html");
    if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      console.log('in runtime')
      fetchData(); 
    }
});

async function fetchData() {
  console.log("in fecth data")
  const options = {
      method: 'GET',
      headers: {
          'X-RapidAPI-Key': '[INSERT API KEY]',
          'X-RapidAPI-Host': 'concerts-artists-events-tracker.p.rapidapi.com'
      }
  };
  
  const res = await fetch('http://localhost:8081/echo', options)
  const record = await res.json()
  console.log("record", record)
  document.getElementById("message").innerHTML = record.message;
}


chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("youtube.com/watch")) {
      const queryParameters = tab.url.split("?")[1];
      const urlParameters = new URLSearchParams(queryParameters);
      console.log("called", urlParameters)
      chrome.tabs.sendMessage(tabId, {
        type: "NEW",
        videoId: urlParameters.get("v"),
      });
    }
  });