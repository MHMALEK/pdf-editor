import { fabric } from "fabric";
import * as pdfjsLib from "pdfjs-dist";
// One of the following themes
import "@simonwep/pickr/dist/themes/classic.min.css"; // 'classic' theme
import "@simonwep/pickr/dist/themes/monolith.min.css"; // 'monolith' theme
import "@simonwep/pickr/dist/themes/nano.min.css"; // 'nano' theme

// Modern or es5 bundle (pay attention to the note below!)
import Pickr from "@simonwep/pickr";
// Simple example, see optional options for more configuration.
const pickr = Pickr.create({
  el: ".color-picker",
  theme: "classic", // or 'monolith', or 'nano'

  swatches: [
    "rgba(244, 67, 54, 1)",
    "rgba(233, 30, 99, 0.95)",
    "rgba(156, 39, 176, 0.9)",
    "rgba(103, 58, 183, 0.85)",
    "rgba(63, 81, 181, 0.8)",
    "rgba(33, 150, 243, 0.75)",
    "rgba(3, 169, 244, 0.7)",
    "rgba(0, 188, 212, 0.7)",
    "rgba(0, 150, 136, 0.75)",
    "rgba(76, 175, 80, 0.8)",
    "rgba(139, 195, 74, 0.85)",
    "rgba(205, 220, 57, 0.9)",
    "rgba(255, 235, 59, 0.95)",
    "rgba(255, 193, 7, 1)",
  ],

  components: {
    // Main components
    preview: true,
    opacity: true,
    hue: true,

    // Input / output Options
    interaction: {
      hex: true,
      rgba: true,
      hsla: true,
      hsva: true,
      cmyk: true,
      input: true,
      clear: true,
      save: true,
    },
  },
});

if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  const WORKER_URL = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
}
import { jsPDF } from "jspdf";
function toggleEditor(show: boolean) {
  var textControls = document.getElementById("wysiwyg-editor-container");

  textControls.style.display = show ? "block" : "none";
}

var url =
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";

// // create a textbox and add it to the canvas
// const textbox = new fabric.Textbox("Hello, world!", { left: 10, top: 10 });
// canvass.add(textbox);

pdfjsLib.getDocument(url).promise.then(function (pdf) {
  // Load the first page
  pdf.getPage(1).then(function (page) {
    var viewport = page.getViewport({ scale: 1.0 });
    var canvas: any = document.getElementById("pdf-canvas");
    var container = document.getElementById("container");
    var context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    container.style.height = `${viewport.height}px`;
    container.style.width = `${viewport.width}px`;
    container.style.position = "absolute";
    container.style.overflow = "hidden";

    // Render the page on the canvas
    var renderTask = page.render({
      canvasContext: context,
      viewport: viewport,
    });

    renderTask.promise.then(function () {
      // Save the canvas as an image
      var canvasImg = canvas.toDataURL();

      let isEditing = false;

      // Pass the canvas to Fabric.js
      var fabricCanvas = new fabric.Canvas("pdf-canvas", {
        isDrawingMode: false,
      });

      fabricCanvas.on("text:editing:entered", function (options) {
        isEditing = true; // Set the flag to true when editing starts

        toggleEditor(true);
      });

      fabricCanvas.on("text:editing:exited", function () {
        isEditing = false; // Set the flag to false when editing ends
        toggleEditor(false);
      });

      // Load the image back into the fabric canvas
      fabric.Image.fromURL(canvasImg, function (img) {
        img.selectable = false;
        // Add the image back to the canvas
        fabricCanvas.add(img);
      });

      // when the delete key is pressed, remove the currently active object
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

      // Add an event handler for the button click
      document
        .getElementById("save-pdf")
        .addEventListener("click", function () {
          // Create a new jsPDF instance
          var doc = new jsPDF();

          // Get the content of the canvas as an image
          var imgData = fabricCanvas.toDataURL({ format: "png" });

          // Add the image to the PDF
          doc.addImage(imgData, 0, 0, 0, 0);

          // Save the PDF
          doc.save("download.pdf");
        });

      document
        .getElementById("add-text")
        .addEventListener("click", function () {
          // Add a text object
          var text = new fabric.IText("Hello, world!", {
            left: 100,
            top: 100,
          });
          fabricCanvas.add(text);
        });

      document
        .getElementById("font-size")
        .addEventListener("change", function () {
          console.log("asdasd");
          updateStyles();
        });

      document
        .getElementById("font-family")
        .addEventListener("change", function () {
          updateStyles();
        });

      fabricCanvas.on("selection:created", function (options) {
        const activeObject = fabricCanvas.getActiveObject();
        console.log(activeObject, options);
        var textControls = document.getElementById("wysiwyg-editor-container");

       

        toggleEditor(true);
        updateStyles();
      });

      fabricCanvas.on("selection:cleared", function () {
        console.log("selection:cleared");
        toggleEditor(false);
      });

      let color: string = "black";
      const updateStyles = (items?: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
      }) => {
        var activeObject = fabricCanvas.getActiveObject();

        console.log(items?.underline);
        // If there is a selected object and it's a text object, update its styles
        if (activeObject) {
          activeObject.set({
            // @ts-ignore
            fontSize: parseInt(document.getElementById("font-size").value),
            fill: color,
            // @ts-ignore
            fontFamily: document.getElementById("font-family").value,
            fontWeight: items?.bold ? "bold" : "normal",
            fontStyle: items?.italic ? "italic" : "normal",
            textDecoration: items?.underline ? "underline" : "",
          });

          fabricCanvas.renderAll();
        }
      };
      document
        .getElementById("boldButton")
        .addEventListener("click", function () {
          updateStyles({
            bold: true,
          });
        });

      document
        .getElementById("italicButton")
        .addEventListener("click", function () {
          updateStyles({
            italic: true,
          });
        });

      document
        .getElementById("underlineButton")
        .addEventListener("click", function () {
          updateStyles({
            underline: true,
          });
        });

      pickr.on("change", (e: any) => {
        console.log(e);
        color = e.toRGBA().toString();
        updateStyles();
      });

      document
        .getElementById("loadImage")
        .addEventListener("click", function () {
          var imageUrl = document.getElementById("imageUrl").value;

          fabric.Image.fromURL(imageUrl, function (img) {
            // Scale the image to 50% of its original size
            var oImg = img.set({ left: 0, top: 0, angle: 0 }).scale(0.5);
            fabricCanvas.add(oImg).renderAll();
          });
        });

      document
        .getElementById("imageUpload")
        .addEventListener("change", function (e: any) {
          var file = e.target.files[0];
          var reader = new FileReader();

          reader.onload = function (f) {
            var data: any = f.target.result;
            fabric.Image.fromURL(data, function (img: any) {
              var oImg = img.set({ left: 0, top: 0 }).scale(1);
              fabricCanvas.add(oImg).renderAll();
              var a = fabricCanvas.setActiveObject(oImg);
            });
          };
          reader.readAsDataURL(file);
        });
    });
  });
});
