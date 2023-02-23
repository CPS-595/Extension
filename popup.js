// adding a new bookmark row to the popup
const addNewBookmark = () => {};

const viewBookmarks = () => {};

const onPlay = e => {};

const onDelete = e => {};

const setBookmarkAttributes =  () => {};

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
fetchData(); 

document.addEventListener("DOMContentLoaded", () => {});
