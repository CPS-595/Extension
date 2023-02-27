// adding a new bookmark row to the popup
const addNewBookmark = () => {};

const viewBookmarks = () => {};

const onPlay = e => {};

const onDelete = e => {};

const setBookmarkAttributes =  () => {};

async function fetchData() {
    console.log("in popup")
    window.crypto.subtle.generateKey(
        {
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: 2048, //can be 1024, 2048, or 4096
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        },
        true, //whether the key is extractable (i.e. can be used in exportKey)
        ["sign", "verify"] //can be any combination of "sign" and "verify"
    )
    .then(function(key){
        //returns a keypair object
        console.log(key);
        console.log(key.publicKey);
        console.log(key.privateKey);
    })
    .catch(function(err){
        console.error(err);
    });
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
fetchData(); 

document.addEventListener("DOMContentLoaded", () => {});
