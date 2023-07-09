import { fabric } from "fabric";
import * as pdfjsLib from "pdfjs-dist";
// // One of the following themes
// import "@simonwep/pickr/dist/themes/classic.min.css"; // 'classic' theme
// import "@simonwep/pickr/dist/themes/monolith.min.css"; // 'monolith' theme
// import "@simonwep/pickr/dist/themes/nano.min.css"; // 'nano' theme
import { jsPDF } from "jspdf";

if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  const WORKER_URL = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
}

// // Modern or es5 bundle (pay attention to the note below!)
// import Pickr from "@simonwep/pickr";
// // Simple example, see optional options for more configuration.
// const pickr = Pickr.create({
//   el: ".color-picker",
//   theme: "classic", // or 'monolith', or 'nano'

//   swatches: [
//     "rgba(244, 67, 54, 1)",
//     "rgba(233, 30, 99, 0.95)",
//     "rgba(156, 39, 176, 0.9)",
//     "rgba(103, 58, 183, 0.85)",
//     "rgba(63, 81, 181, 0.8)",
//     "rgba(33, 150, 243, 0.75)",
//     "rgba(3, 169, 244, 0.7)",
//     "rgba(0, 188, 212, 0.7)",
//     "rgba(0, 150, 136, 0.75)",
//     "rgba(76, 175, 80, 0.8)",
//     "rgba(139, 195, 74, 0.85)",
//     "rgba(205, 220, 57, 0.9)",
//     "rgba(255, 235, 59, 0.95)",
//     "rgba(255, 193, 7, 1)",
//   ],

//   components: {
//     // Main components
//     preview: true,
//     opacity: true,
//     hue: true,

//     // Input / output Options
//     interaction: {
//       hex: true,
//       rgba: true,
//       hsla: true,
//       hsva: true,
//       cmyk: true,
//       input: true,
//       clear: true,
//       save: true,
//     },
//   },
// });

// if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
//   const WORKER_URL = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
//   pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
// }
// import { jsPDF } from "jspdf";
function toggleEditor(show: boolean) {
  var textControls = document.getElementById("wysiwyg-editor-container");

  textControls.style.display = show ? "block" : "none";
}

let isEditing = false;

//     // Render the page on the canvas
//     var renderTask = page.render({
//       canvasContext: context,
//       viewport: viewport,
//     });

//     renderTask.promise.then(function () {
//       // Save the canvas as an image
//       var canvasImg = canvas.toDataURL();

//       // Pass the canvas to Fabric.js
//       var fabricCanvas = new fabric.Canvas("pdf-canvas", {
//         isDrawingMode: false,
//       });

//       // Load the image back into the fabric canvas
//       fabric.Image.fromURL(canvasImg, function (img) {
//         img.selectable = false;
//         // Add the image back to the canvas
//         fabricCanvas.add(img);
//       });

//

//       // Add an event handler for the button click
//       document
//         .getElementById("save-pdf")
//         .addEventListener("click", function () {
//           // Create a new jsPDF instance
//           var doc = new jsPDF();

//           // Get the content of the canvas as an image
//           var imgData = fabricCanvas.toDataURL({ format: "png" });

//           // Add the image to the PDF
//           doc.addImage(imgData, 0, 0, 0, 0);

//           // Save the PDF
//           doc.save("download.pdf");
//         });

//       document
//         .getElementById("add-text")
//         .addEventListener("click", function () {
//           // Add a text object
//           var text = new fabric.IText("Hello, world!", {
//             left: 100,
//             top: 100,
//           });
//           fabricCanvas.add(text);
//         });

//       document
//         .getElementById("font-size")
//         .addEventListener("change", function () {
//           console.log("asdasd");
//           updateStyles();
//         });

//       document
//         .getElementById("font-family")
//         .addEventListener("change", function () {
//           updateStyles();
//         });

//       fabricCanvas.on("selection:created", function (options) {
//         const activeObject = fabricCanvas.getActiveObject();
//         console.log(activeObject, options);
//         var textControls = document.getElementById("wysiwyg-editor-container");

//         toggleEditor(true);
//         updateStyles();
//       });

//       fabricCanvas.on("selection:cleared", function () {
//         console.log("selection:cleared");
//         toggleEditor(false);
//       });

//       let color: string = "black";
//       const updateStyles = (items?: {
//         bold?: boolean;
//         italic?: boolean;
//         underline?: boolean;
//       }) => {
//         var activeObject = fabricCanvas.getActiveObject();

//         console.log(items?.underline);
//         // If there is a selected object and it's a text object, update its styles
//         if (activeObject) {
//           activeObject.set({
//             // @ts-ignore
//             fontSize: parseInt(document.getElementById("font-size").value),
//             fill: color,
//             // @ts-ignore
//             fontFamily: document.getElementById("font-family").value,
//             fontWeight: items?.bold ? "bold" : "normal",
//             fontStyle: items?.italic ? "italic" : "normal",
//             textDecoration: items?.underline ? "underline" : "",
//           });

//           fabricCanvas.renderAll();
//         }
//       };
//       document
//         .getElementById("boldButton")
//         .addEventListener("click", function () {
//           updateStyles({
//             bold: true,
//           });
//         });

//       document
//         .getElementById("italicButton")
//         .addEventListener("click", function () {
//           updateStyles({
//             italic: true,
//           });
//         });

//       document
//         .getElementById("underlineButton")
//         .addEventListener("click", function () {
//           updateStyles({
//             underline: true,
//           });
//         });

//       pickr.on("change", (e: any) => {
//         console.log(e);
//         color = e.toRGBA().toString();
//         updateStyles();
//       });

//       document
//         .getElementById("loadImage")
//         .addEventListener("click", function () {
//           var imageUrl = document.getElementById("imageUrl").value;

//           fabric.Image.fromURL(imageUrl, function (img) {
//             // Scale the image to 50% of its original size
//             var oImg = img.set({ left: 0, top: 0, angle: 0 }).scale(0.5);
//             fabricCanvas.add(oImg).renderAll();
//           });
//         });

//       document
//         .getElementById("imageUpload")
//         .addEventListener("change", function (e: any) {
//           var file = e.target.files[0];
//           var reader = new FileReader();

//           reader.onload = function (f) {
//             var data: any = f.target.result;
//             fabric.Image.fromURL(data, function (img: any) {
//               var oImg = img.set({ left: 0, top: 0 }).scale(1);
//               fabricCanvas.add(oImg).renderAll();
//               var a = fabricCanvas.setActiveObject(oImg);
//             });
//           };
//           reader.readAsDataURL(file);
//         });
//     });
//   });
// });

var url =
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";

var scale = 1.5;
let fabricCanvases: any = [];
// let selectedCanvas; // This variable will hold the currently selected Fabric.js canvas

// // Function to select a Fabric.js canvas
// function selectCanvas(canvas) {
//   selectedCanvas = canvas;
// }

// const selectAllCanvasesInDom = () => {
//   // Call the selectCanvas function when a canvas is selected
//   // For example, when a canvas element is clicked
//   let canvases = document.querySelectorAll('[id^="canvas-id-"]');

//   canvases.forEach((canvasElement) => {
//     canvasElement.addEventListener("click", () => {
//       // Assume that fabricCanvases is the array holding all Fabric.js canvas instances
//       let fabricCanvas = fabricCanvases.find(
//         (canvas) => canvas.lowerCanvasEl === canvasElement
//       );
//       selectCanvas(fabricCanvas);
//     });
//   });
// };

// Function to add new text to the selected Fabric.js canvas
function addTextToSelectedCanvas(text) {
  console.log(fabricCanvases);
  // let fabricCanvas = fabricCanvases.find(
  //   (canvas) => canvas.lowerCanvasEl === canvasElement
  // );
  // if (selectedCanvas) {
  //   let text = new fabric.Text(text, { left: 10, top: 10 });
  //   selectedCanvas.add(text);
  //   selectedCanvas.renderAll();
  // } else {
  //   console.log("No canvas is currently selected");
  // }
}

// Call the addTextToSelectedCanvas function to add new text to the selected canvas
// For example, when a button is clicked
document.getElementById("add-text").addEventListener("click", () => {
  addTextToSelectedCanvas("New text");
});

async function getPageAsImage(pdf, pageNumber) {
  let page = await pdf.getPage(pageNumber);
  let viewport = page.getViewport({ scale: scale });

  const canvasId = `canvas-id-${pageNumber}`;
  // Create a new canvas for each page
  let canvas = document.createElement("canvas");
  canvas.id = canvasId;
  canvas.style.marginBottom = "20px";

  document.getElementById("pdf-container").appendChild(canvas);

  let ctx = canvas.getContext("2d");
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  // Render the page on the canvas
  var renderTask = page.render({
    canvasContext: ctx,
    viewport: viewport,
  });

  renderTask.promise.then(function () {
    // Save the canvas as an image
    var canvasImg = canvas.toDataURL();

    // Pass the canvas to Fabric.js
    const fabricCanvas = new fabric.Canvas(canvasId, {
      isDrawingMode: false,
    });
    // Load the image back into the fabric canvas
    fabric.Image.fromURL(canvasImg, function (img) {
      // Add the image back to the canvas
      // img.selectable = false;
      fabricCanvas.add(img);
    });
    fabricCanvases.push(fabricCanvas);

    //  when the delete key is pressed, remove the currently active object
    window.addEventListener("keydown", function (e) {
      // key code 46 is the delete key
      // key code 8 is the backspace key
      if ((e.keyCode === 46 || e.keyCode === 8) && !isEditing) {
        const activeObject = fabricCanvas.getActiveObject();

        if (activeObject) {
          fabricCanvas.remove(activeObject);
        }
      }
    });

    document.getElementById("add-text").addEventListener("click", function () {
      // Add a text object
      var text = new fabric.IText("Hello, world!", {
        left: 100,
        top: 100,
      });
      fabricCanvas.add(text);
    });

    fabricCanvas.on("text:editing:entered", function (options) {
      isEditing = true; // Set the flag to true when editing starts

      toggleEditor(true);
    });

    fabricCanvas.on("text:editing:exited", function () {
      isEditing = false; // Set the flag to false when editing ends
      toggleEditor(false);
    });
  });

  // return canvas.toDataURL();
}

document
  .getElementById("generate-pdf")
  .addEventListener("click", async function () {
    let pdf = await pdfjsLib.getDocument(url).promise;

    let pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      pages.push(getPageAsImage(pdf, i));
    }
  });

document
  .getElementById("add-page-pdf")
  .addEventListener("click", async function () {
    const canvasId = `canvas-id-${16}`;
    // Create a new canvas for each page
    let canvas = document.createElement("canvas");
    canvas.id = canvasId;

    document.body.appendChild(canvas);

    canvas.height = 1188;
    canvas.width = 918;

    // Save the canvas as an image
    var canvasImg = canvas.toDataURL();

    // Pass the canvas to Fabric.js
    const fabricCanvas = new fabric.Canvas(canvasId, {
      isDrawingMode: false,
    });

    fabricCanvas.backgroundColor = "white";
    fabricCanvas.renderAll();

    // Load the image back into the fabric canvas
    fabric.Image.fromURL(canvasImg, function (img) {
      // Add the image back to the canvas
      fabricCanvas.add(img);
    });
    fabricCanvases.push(fabricCanvas);
  });

document
  .getElementById("save-pdf")
  .addEventListener("click", async function () {
    let canvases = document.querySelectorAll('[id^="canvas-id-"]');

    // Initialize a new jsPDF document
    let pdf = new jsPDF();

    // Loop over the range of page numbers
    for (let i = 0; i < canvases.length; i++) {
      // Generate the id for the canvas

      // Get the canvas with the generated id
      let canvas: any = canvases[i];

      let imageUrl = canvas.toDataURL("image/jpeg", 0.8);

      let aspectRatio = canvas.width / canvas.height;
      let newWidth = 180; // or whatever width you choose
      let newHeight = newWidth / aspectRatio;

      // Add the image to the PDF document
      // Note: adjust the position and dimensions as needed
      pdf.addImage(imageUrl, "JPEG", 15, 40, 180, 160);

      // If this is not the last page, add a new page to the PDF document
      if (i < canvases.length - 1) {
        pdf.addPage();
      }
    }

    // Save the PDF document
    pdf.save("output.pdf");
  });
