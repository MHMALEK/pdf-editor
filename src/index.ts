import { createColorPicker } from "./helpers/color-picker";

import { state } from "./globals";

import { initializePDFjsWorker } from "./helpers/pdfjs-worker";
import {
  addText,
  updateStyles,
  deleteActiveObject,
  loadImage,
  handleImageUpload,
  formatBlock,
  removeCurrentPdf,
  savePDF,
  toggleNavBar,
  toggleUploader,
  handlePDFUpload,
} from "./helpers/pdf-helpers";

// Create a color picker
const colorPicker = createColorPicker(".color-picker");
// Ensure pdfjs worker is initialized
initializePDFjsWorker();

setupEventListeners();

function setupEventListeners() {
  // Set up event listeners for your buttons, input elements, etc.

  document
    .getElementById("pdf-upload-dropzone-file")
    .addEventListener("change", (e) => {
      handlePDFUpload(e);
      toggleNavBar(true);
    });

  document.getElementById("new-pdf-upload").addEventListener("click", () => {
    toggleUploader(true);
    removeCurrentPdf();
  });

  document.getElementById("save-pdf").addEventListener("click", savePDF);
  document.getElementById("add-text").addEventListener("click", addText);
  document.getElementById("font-size").addEventListener("change", updateStyles);
  document
    .getElementById("font-family")
    .addEventListener("change", updateStyles);
  document
    .getElementById("boldButton")
    .addEventListener("click", () => updateStyles({ bold: true }));
  document
    .getElementById("italicButton")
    .addEventListener("click", () => updateStyles({ italic: true }));

  colorPicker.on("change", (e: any) => {
    state.color = e.toRGBA().toString();
    updateStyles();
  });

  window.addEventListener("keydown", deleteActiveObject);
  document.getElementById("loadImage").addEventListener("click", loadImage);
  document
    .getElementById("imageUpload")
    .addEventListener("change", handleImageUpload);

  document.getElementById("h1FormatButton").addEventListener("click", () => {
    formatBlock("H1");
  });
  document.getElementById("h2FormatButton").addEventListener("click", () => {
    formatBlock("H2");
  });
  document.getElementById("h3FormatButton").addEventListener("click", () => {
    formatBlock("H3");
  });
}
