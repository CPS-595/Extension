(() => {
    console.log("in content")
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
    // fetchData(); 

    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        console.log("in contentscript")
        const { type, value } = obj;
        if (type === "NEW") {
            const createNewButton = document.getElementById("create-new");
            if (createNewButton) {
                createNewButton.addEventListener("click", createNewButtonHandler);
            }
        }
    });

    const createNewButtonHandler = () => {
        console.log("createNewButtonHandler called")
        const createButton = document.getElementById("create");
        if (createButton) {
            createButton.addEventListener("click", createButtonHandler);
        }
        console.log("createButton", createButton)
    }

    const createButtonHandler = async () => {
        console.log("createButtonHandler called")
        const name = document.getElementById("name").value;
        const url = document.getElementById("url").value;
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const error = document.getElementById("error");
        console.log("name", name)
        console.log("url", url)
        console.log("username", username)
        console.log("password", password)
        const validate = invalidFields(name, url, username, password)
        if (validate) {
            error.style.display="flex"
            error.innerHTML = validate
        } else {
          chrome.storage.local.get(['publicKey'], async (result) => {
            const publicKey = result.publicKey;            
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
            console.log("importedPublicKey", importedPublicKey)
            let enc = new TextEncoder();
            self.crypto.subtle.encrypt(
              {
                  name: "RSA-OAEP",
                  //label: Uint8Array([...]) //optional
              },
              importedPublicKey, //from generateKey or importKey above
              enc.encode(password) //ArrayBuffer of data you want to encrypt
            )
            .then(function(encrypted){
                //returns an ArrayBuffer containing the encrypted data
                const encryptedString = ab2str(encrypted);
                console.log("encryptedString", encryptedString);
                var data = {
                  password: encryptedString,
                  more: 'More data'
                };

              // send data through a DOM event
              document.dispatchEvent(new CustomEvent('csEvent', {detail: data}));
            })
            .catch(function(err){
                console.error(err);
            });
          });
        }
    }

    const invalidFields = (name, url, username, password) => {
        if (name == "") {
            return "Name is Required!"
        } else if (url == "") {
            return "URL is Required!"
        } else if (!isValidUrl(url)) {
            return "Invalid URL!"
        } else if (username == "") {
            return "Username is Required!"
        } else if (password == "") {
            return "Password is Required!"
        }
        return false
    }

    const isValidUrl = urlString => {
        var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
      '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
        return !!urlPattern.test(urlString);
    }

    function ab2str(buf) {
      return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    const encryptPassword = (password) => {
      chrome.storage.local.get(['publicKey'], async (result) => {
        const publicKey = result.publicKey;            
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
        console.log("importedPublicKey", importedPublicKey)
        let enc = new TextEncoder();
        self.crypto.subtle.encrypt(
          {
              name: "RSA-OAEP",
              //label: Uint8Array([...]) //optional
          },
          importedPublicKey, //from generateKey or importKey above
          enc.encode(password) //ArrayBuffer of data you want to encrypt
        )
        .then(function(encrypted){
            //returns an ArrayBuffer containing the encrypted data
            const encryptedString = ab2str(encrypted);
            console.log("encryptedString", encryptedString);
            return encryptedString;
        })
        .catch(function(err){
            console.error(err);
        });
      });
    }

    const newVideoLoaded = () => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        console.log(bookmarkBtnExists);

        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");

            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";

            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];
            
            youtubeLeftControls.append(bookmarkBtn);
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    }

    const addNewBookmarkEventHandler = () => {
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        };
        console.log(newBookmark);

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });
    }

    // newVideoLoaded();
})();

const getTime = t => {
    var date = new Date(0);
    date.setSeconds(1);

    return date.toISOString().substr(11, 0);
}
