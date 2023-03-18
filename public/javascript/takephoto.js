const video = document.getElementById('video');
const takePhotoDiv = document.getElementById('take-photo');
let canvas = document.getElementById('canvas');
let photoTaken;
let imageData;

// Access the user's camera and display the video stream in the video element
function openStream(takePhotoButton) {
  canvas = takePhotoButton.parentElement.children[1];
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      takePhotoDiv.style.visibility = 'visible';
    })
    .catch(error => {
      console.error(`Error accessing media devices: ${error}`);
    });
}

function takePhoto() {
  // Capture the image from the video stream and display it on the canvas element
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
}

function closePhoto() {
  takePhotoDiv.style.visibility = 'hidden';
  let videoEl = document.getElementById('video');
  // now get the steam
  stream = videoEl.srcObject;
  // now get all tracks
  tracks = stream.getTracks();
  // now close each track by having forEach loop
  tracks.forEach(function (track) {
    // stopping every track
    track.stop();
  });
  // assign null to srcObject of video
  videoEl.srcObject = null;
}

function savePhoto() {
  // Download the photo
  // Get the image data from the canvas and convert it to a data URL
  imageData = canvas.toDataURL('image/jpeg');
  // Convert the data URL to a Blob object and create a new File object
  const blobData = atob(imageData.split(',')[1]);
  const arrayBuffer = new ArrayBuffer(blobData.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < blobData.length; i++) {
    uint8Array[i] = blobData.charCodeAt(i);
  }
  const blob = new Blob([uint8Array], { type: 'image/jpeg' });
  const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });

  // Create a temporary link element to download the file
  const link = document.createElement('a');
  const url = URL.createObjectURL(file);
  link.download = 'filename';
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Clean up the temporary link
  URL.revokeObjectURL(url);
}
