/**
 * Page Load
 */
const allPages = document.querySelectorAll("section.page");

function displayCurrentSection(event) {
  const pageId = location.hash ? location.hash : "#select-location";
  for (let page of allPages) {
    if (pageId === "#" + page.id) {
      page.style.display = "block";
    } else {
      page.style.display = "none";
    }
  }
  return;
}
displayCurrentSection();

window.addEventListener("hashchange", displayCurrentSection);

/**
 * Hazard Report Form State
 */
class ReportForm {
  constructor() {
    this.categoryId = null;
    this.categoryOptionId = null;
    this.location = {
      lat: null,
      lng: null,
      address: null,
    };
    this.comment = null;
    this.images = [];
  }
}

const currentReport = new ReportForm();

/**
 * Step 1: Location
 */
let map = L.map("map").setView([49.22386, 236.8924], 15);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

map.on("click", onSelectLocation);

let marketCoordenated = [49.2388545, -123.1556304];

let marker = L.marker(marketCoordenated)
  .addTo(map)
  .bindPopup("Location selected")
  .openPopup();

function onSelectLocation(event) {
  map.removeLayer(marker);
  marker = L.marker([event.latlng.lat, event.latlng.lng], { draggable: false })
    .addTo(map)
    .bindPopup("Location selected")
    .openPopup();

  const baseURL =
    "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=pjson&featureTypes=StreetInt&location=";

  let long = event.latlng.lng;
  let lati = event.latlng.lat;

  url = baseURL + long + "%2c" + lati;
  addressData = "";
  console.log(url)

  async function getAddress() {
    let res = await fetch(url);
    let data = await res.json();

    addressData = data.address.LongLabel;

    locationAddressInput.innerHTML = addressData;

    currentReport.location = {
      lat: event.latlng.lat,
      lng: event.latlng.lng,
      address: addressData,
    };
  }
  getAddress();
}

map.on("geosearch_showlocation", function (result) {
  console.log({ result });
  L.marker([result.x, result.y]).addTo(map);
});

/**
 * Step 2: Category List
 */

async function getCategory() {
  const baseURL =
    "https://enchanting-llama-6664aa.netlify.app/.netlify/functions/hazard-category";

  let res = await fetch(baseURL);
  let data = await res.json();

  for (let i = 0; i < data.data.length; i++) {
    categoryData = data.data[i].name;
    var catego = document.getElementById("category" + (i + 1));
    catego.innerHTML = data.data[i].name;
  }
}
getCategory();

document
  .querySelectorAll('[name="categoryRadioBtn"]')
  .forEach((categoryElement) => {
    categoryElement.addEventListener("change", (event) => {
      window.location.href = "#hazard-type"; //TODO: Review this, because is hard for the user when you are using the keyboard

      currentReport.categoryId = event.target.value;
    });
  });

/**
 * Step 3: Hazard Options List
 */
document
  .querySelectorAll('[name="hazardOptionRadioBtn"]')
  .forEach((categoryElement) => {
    categoryElement.addEventListener("change", (event) => {
      window.location.href = "#additional-details"; //TODO: Review this, because is hard for the user when you are using the keyboard
      currentReport.categoryOptionId = event.target.value;
    });
  });

/**
 * Step 4: Comments
 */
commentInput.addEventListener("change", (event) => {
  currentReport.comment = event.target.value;
});

/**
 * Step 5: Images
 * Pending
 */
let arrayPict = [];

const video = document.getElementById("video");

// Elements for taking the snapshot
const canvas1 = document.getElementById("canvas-1");
const context1 = canvas1.getContext("2d");
context1.scale(0.5, 0.5);

// elements to control actions
const startBtn = document.getElementById("starCameraBtn");
const stopBtn = document.getElementById("stop");
const sapBtn = document.getElementById("takePictureBtn");

function startCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` bcuz we only want video
    const mediaPromise = navigator.mediaDevices.getUserMedia({ video: true });
    mediaPromise.then((stream) => {
      // called if successful
      video.srcObject = stream;
      // video.play();  // or autplay
      startBtn.disabled = true;
      stopBtn.disabled = false;
    });
    mediaPromise.catch((error) => {
      console.error(error);
      // called if failed
      context1.font = "20px Tahoma";
      context1.fillText(error, 20, 100);
    });
    sapBtn.disabled = false;
  } else {
    console.log("this browser doesn't support media devices");
  }
}
// attach startCamera function to start button
startBtn.addEventListener("click", startCamera);

function stopCamera() {
  const tracks = video.srcObject.getTracks();
  tracks.forEach((track) => track.stop());
  startBtn.disabled = false;
  stopBtn.disabled = true;
  sapBtn.disabled = true;
}
// attach stopCamera function to stop button
stopBtn.addEventListener("click", stopCamera);


// let arrayPict = [];

// attach snapPhoto function to snap button
document.getElementById("takePictureBtn").addEventListener("click", snapPhoto);

// Trigger taking photo
function snapPhoto() {
  
  if (arrayPict.length < 3) {
    //canvas.width = video.videoWidth;
    //canvas.height = video.videoHeight;
    context1.drawImage(video, 0, 0);

    const canvasDataURL = canvas1.toDataURL();
    //here you can upload this data to store image in an Storage
    
    console.log(canvasDataURL);
    // let imageCell = currentReport.images?`<img src=${currentReport.images} width="150" />`:"No Image Provided";
    arrayPict.push(canvasDataURL);
    console.log(arrayPict);
    // currentReport.images = imageCell;
    // //this is just to show we can also create image element
    // createSnapshotImage(canvasDataURL);
    // currentReport.images = arrayPict;
  } else {
    console.log("You have already taken 3 pictures.");
  }currentReport.images = arrayPict;
  imagesFirstOutput.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    if (currentReport.images[i]) {
      imagesFirstOutput.innerHTML += `<img src="${currentReport.images[i]}" width="150" />`;
    } else {
      imagesFirstOutput.innerHTML += "No Image Provided";
    }
  }
}
// function createSnapshotImage(dataURL) {
//   const copyImg = document.createElement('img');
//   copyImg.style.height = '120px';
//   copyImg.src = dataURL;
//   document.body.appendChild(copyImg);
// }


// const selectedFile = document.getElementById("inputFile").files[0];
const base64Data = "";
const fileInput = document.getElementById('inputFile');
      const selectedFile = fileInput.files[0];
      console.log(selectedFile)

document.getElementById('inputFile').addEventListener('click', function(){
if (selectedFile) {
  const reader = new FileReader();
  reader.onload = function() {
    const base64Data = reader.result;
    console.log(base64Data)
  };
  reader.readAsDataURL(selectedFile);
}
console.log(base64Data)})


// const target = document.getElementById('target');

//   target.addEventListener('drop', (e) => {
//     e.stopPropagation();
//     e.preventDefault();

//     doSomethingWithFiles(e.dataTransfer.files);
//   });

//   target.addEventListener('dragover', (e) => {
//     e.stopPropagation();
//     e.preventDefault();

//     e.dataTransfer.dropEffect = 'copy';
//   });

/**
 * Step 6: Show Confirmation
 */
showConfirmationBtn.addEventListener("click", () => {
  locationOutput.innerHTML = `${currentReport.location.address} (${currentReport.location.lat},${currentReport.location.lng})`;
  categoryOutput.innerHTML = currentReport.categoryId;
  hazardOptionOutput.innerHTML = currentReport.categoryOptionId;
  commentOutput.innerHTML = currentReport.comment;
  imagesOutput.innerHTML = "";
  imagesOutput2.innerHTML = `<img src="${base64Data[0]}" width="150" />`;

  for (let i = 0; i < 3; i++) {
    if (currentReport.images[i]) {
      imagesOutput.innerHTML += `<img src="${currentReport.images[i]}" width="150" />`;
    } else {
      imagesOutput.innerHTML += "No Image Provided";
    }
  }
});

/**
 * Submit Form
 */
reportHazardForm.addEventListener("submit", function (event) {
  event.preventDefault();
  console.log(currentReport);
  //TODO: Hit create hazard report endpoint
});
