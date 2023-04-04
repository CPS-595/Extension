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

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

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
  .then(async function(key){
    //returns a keypair object
    console.log("public key", key.publicKey);
    console.log("private key", key.privateKey);
    const exportedPublicKey = await self.crypto.subtle.exportKey(
      "jwk",
      key.publicKey
    );
    const exportedPrivateKey = await self.crypto.subtle.exportKey(
      "jwk",
      key.privateKey
    );
    console.log("exportedPublicKey", exportedPublicKey)
    console.log("exportedPrivateKey", exportedPrivateKey)
    self.chrome.tabs.sendMessage("publickey", {
      type: "publicKey",
      // videoId: urlParameters.get("v"),
    });
    // self.document.dispatchEvent(new CustomEvent('publickey', {detail: exportedPublicKey}));
    
    chrome.storage.local.set({ publicKey: exportedPublicKey, privateKey: exportedPrivateKey }, () => {
      console.log('Public and private keys stored in local storage.');
    });
    // Get the public and private keys
    
    chrome.storage.local.get(['publicKey', 'privateKey'], async (result) => {
        const publicKey = result.publicKey;
        const privateKey = result.privateKey;
      
        // Convert PEM-encoded keys to Forge key objects
        
        const importedPublicKey =  await self.crypto.subtle.importKey(
          "jwk", //can be "jwk" or "raw"
            publicKey,
            {   //these are the algorithm options
              name: "RSA-OAEP",
              hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
          },
          false, //whether the key is extractable (i.e. can be used in exportKey)
          ["encrypt"]
        )
        const importedPrivateKey =  await self.crypto.subtle.importKey(
          "jwk", //can be "jwk" or "raw"
          privateKey,
            {   //these are the algorithm options
              name: "RSA-OAEP",
              hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
          },
          false, //whether the key is extractable (i.e. can be used in exportKey)
          ["decrypt"]
        )
        console.log("importedPublicKey", importedPublicKey)
        console.log("importedPrivateKey", importedPrivateKey)
        let enc = new TextEncoder();
        self.crypto.subtle.encrypt(
          {
              name: "RSA-OAEP",
              //label: Uint8Array([...]) //optional
          },
          importedPublicKey, //from generateKey or importKey above
          enc.encode("omkar") //ArrayBuffer of data you want to encrypt
        )
        .then(function(encrypted){
            //returns an ArrayBuffer containing the encrypted data
            console.log("text to encrpyt: omkar")
            const encryptedString = ab2str(encrypted);
            console.log("encryptedString", encryptedString);
            const encryptedAb = str2ab(encryptedString);
            console.log("encryptedAb", encryptedAb)
            // let encr = new TextDecoder();
            // console.log("encrypted", encr.decode(encrypted))
            self.crypto.subtle.decrypt(
              {
                  name: "RSA-OAEP",
                  //label: Uint8Array([...]) //optional
              },
              importedPrivateKey, //from generateKey or importKey above
              encryptedAb //ArrayBuffer of the data
          )
          .then(function(decrypted){
            console.log("decrypted", decrypted)
            let dec = new TextDecoder();
            console.log("decrypted", dec.decode(decrypted));
              //returns an ArrayBuffer containing the decrypted data
              // console.log("decrypted", new Uint8Array(null, decrypted));
          })
          .catch(function(err){
              console.error(err);
          });
        })
        .catch(function(err){
            console.error(err);
        });
      });
  })
  .catch(function(err){
    console.error(err);
  });
}


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.url.includes("localhost:3000/credentials")) {
      // const queryParameters = tab.url.split("?")[1];
      // const urlParameters = new URLSearchParams(queryParameters);
      console.log("called on tab", changeInfo)
        console.log("sending")
        chrome.tabs.sendMessage(tabId, {
          type: "NEW",
          // videoId: urlParameters.get("v"),
        });
    }
  });