console.log("background called")

// chrome.scripting.executeScript({
//   target: { tabId: currentTab.id },
//   func: () => {
//     console.log("in script")
//   }
// }); 

chrome.runtime.onInstalled.addListener(function (object) {
    // let externalUrl = "http://yoursite.com/";
    // let internalUrl = chrome.runtime.getURL("views/onboarding.html");
    if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      console.log('in runtime')
      fetchData(); 
    }
});

async function fetchData() {
  self.crypto.subtle.generateKey(
    {
        name: "RSA-OAEP",
        modulusLength: 2048, //can be 1024, 2048, or 4096
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    },
    true, //whether the key is extractable (i.e. can be used in exportKey)
    ["encrypt", "decrypt"] //must be ["encrypt", "decrypt"] or ["wrapKey", "unwrapKey"]
  )
  .then(function(key){
    //returns a keypair object
    console.log("private/public key pair", key);
    console.log("public key", key.publicKey);
    console.log("private key", key.privateKey);
    // let enc = new TextEncoder();
    // self.crypto.subtle.encrypt(
    //   {
    //       name: "RSA-OAEP",
    //       //label: Uint8Array([...]) //optional
    //   },
    //   key.publicKey, //from generateKey or importKey above
    //   enc.encode("omkar") //ArrayBuffer of data you want to encrypt
    // )
    // .then(function(encrypted){
    //     //returns an ArrayBuffer containing the encrypted data
    //     console.log("text to encrpyt: omkar")
    //     console.log("encrypted", new Uint8Array(encrypted));
    //     let encr = new TextDecoder();
    //     console.log("encrypted", encr.decode(encrypted))
    //     self.crypto.subtle.decrypt(
    //       {
    //           name: "RSA-OAEP",
    //           //label: Uint8Array([...]) //optional
    //       },
    //       key.privateKey, //from generateKey or importKey above
    //       encrypted //ArrayBuffer of the data
    //   )
    //   .then(function(decrypted){
    //     let dec = new TextDecoder();
    //     console.log("decrypted", dec.decode(decrypted));
    //       //returns an ArrayBuffer containing the decrypted data
    //       // console.log("decrypted", new Uint8Array(null, decrypted));
    //   })
    //   .catch(function(err){
    //       console.error(err);
    //   });
    // })
    // .catch(function(err){
    //     console.error(err);
    // });
  })
  .catch(function(err){
    console.error(err);
  });
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