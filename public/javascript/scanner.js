('use strict');
const cameraView = document.getElementById('camera');
const scanButton = document.getElementById('scan-button');
let _scannerIsRunning;

function startScanner() {
  // Initialize Quagga and start the camera
  Quagga.init(
    {
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: cameraView,
        constraints: {
          width: 400,
          height: 400,
          facingMode: 'environment',
        },
      },
      locator: {
        patchSize: 'large',
        halfSample: true,
      },
      numOfWorkers: 4,
      frequency: 10,
      decoder: {
        readers: ['code_128_reader', 'ean_reader', 'ean_8_reader'],
      },
      locate: true,
    },
    function (err) {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Quagga initialized successfully');
      Quagga.start();
    }
  );

  Quagga.onProcessed(function (result) {
    var drawingCtx = Quagga.canvas.ctx.overlay,
      drawingCanvas = Quagga.canvas.dom.overlay;

    if (result) {
      if (result.boxes) {
        drawingCtx.clearRect(
          0,
          0,
          parseInt(drawingCanvas.getAttribute('width')),
          parseInt(drawingCanvas.getAttribute('height'))
        );
        result.boxes
          .filter(function (box) {
            return box !== result.box;
          })
          .forEach(function (box) {
            Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: 'green', lineWidth: 2 });
          });
      }

      if (result.box) {
        Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: '#00F', lineWidth: 2 });
      }

      if (result.codeResult && result.codeResult.code) {
        Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
      }
    }
  });

  // Add event listener for when a barcode is detected
  Quagga.onDetected(function (result) {
    console.log('Barcode detected:', result.codeResult);
    cameraView.style.visibility = 'hidden';
    Quagga.stop();
  });
}

function cameraShow() {
  if (_scannerIsRunning) {
    _scannerIsRunning = false;
    Quagga.stop();
    cameraView.style.visibility = 'hidden';
  } else {
    _scannerIsRunning = true;
    cameraView.style.visibility = 'visible';
    startScanner();
  }
}
