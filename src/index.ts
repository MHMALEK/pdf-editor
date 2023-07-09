import { fabric } from "fabric";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";
import "@simonwep/pickr/dist/themes/classic.min.css";
import Pickr from "@simonwep/pickr";

// Global variables
let fabricCanvas: any;
let isEditing = false;
let color = "black";

// Create a color picker
const colorPicker = createColorPicker(".color-picker");

// Ensure pdfjs worker is initialized
initializePDFjsWorker();
// setupEventListeners()
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

// Helper functions

function handlePDFUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files[0];
  const reader = new FileReader();

  reader.onload = async (event) => {
    const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
    // Load and render the first page of a PDF file
    renderPDF(typedarray as ArrayBuffer, "pdf-canvas")
      .then((canvas) => createFabricCanvas(canvas, "pdf-canvas"))
      .then(() => setupEventListeners())
      .then(() => toggleUploader(false));
  };

  reader.readAsArrayBuffer(file);
}

function createColorPicker(selector: string) {
  return Pickr.create({
    el: selector,
    theme: "classic",
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
}

function initializePDFjsWorker() {
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    const WORKER_URL = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
  }
}

async function renderPDF(url: ArrayBuffer, canvasId: string) {
  const pdf = await pdfjsLib.getDocument({ data: url }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  const context = canvas.getContext("2d");

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: context, viewport }).promise;

  return canvas;
}

function createFabricCanvas(canvas: HTMLCanvasElement, fabricCanvasId: string) {
  const canvasImg = canvas.toDataURL();

  fabricCanvas = new fabric.Canvas(fabricCanvasId, {
    isDrawingMode: false,
  });

  fabricCanvas.on("text:editing:entered", () => {
    isEditing = true;
    setTimeout(() => {
      toggleEditor(true);
    }, 400);
  });

  fabricCanvas.on("text:editing:exited", () => {
    isEditing = false;
    resetStyles()
    setTimeout(() => {
      toggleEditor(false);
    }, 400);
  });

  fabric.Image.fromURL(canvasImg, (img) => {
    img.selectable = false;
    fabricCanvas.add(img);
  });

  fabricCanvas.on("selection:created");
  fabricCanvas.on("selection:cleared", () => {
    toggleEditor(false);
  });
}

function setupEventListeners() {
  // Set up event listeners for your buttons, input elements, etc.

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
    color = e.toRGBA().toString();
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

function savePDF() {
  const doc = new jsPDF();
  const imgData = fabricCanvas.toDataURL({ format: "png" });
  doc.addImage(imgData, 0, 0, 0, 0);
  doc.save("download.pdf");
}

function addText() {
  const text = new fabric.IText("Hello, world!", {
    left: 100,
    top: 100,
    fontSize: 30,
  });
  fabricCanvas.add(text);
}

function deleteActiveObject(e: KeyboardEvent) {
  if ((e.keyCode === 46 || e.keyCode === 8) && !isEditing) {
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      fabricCanvas.remove(activeObject);
    }
  }
}

function updateStyles(items?: any) {
  const activeObject = fabricCanvas.getActiveObject();
  if (activeObject) {
    activeObject.set({
      fontSize: items?.fontSize
        ? parseInt(items?.fontSize)
        : parseInt(
            (document.getElementById("font-size") as HTMLInputElement).value
          ),
      fill: color,
      fontFamily: (document.getElementById("font-family") as HTMLInputElement)
        .value,
      fontWeight: items?.bold ? "bold" : "normal",
      fontStyle: items?.italic ? "italic" : "normal",
    });

    fabricCanvas.renderAll();
    toggleEditor(true);
  }
}

function loadImage() {
  const imageUrl = (document.getElementById("imageUrl") as HTMLInputElement)
    .value;

  fabric.Image.fromURL(imageUrl, (img) => {
    const oImg = img.set({ left: 0, top: 0, angle: 0 }).scale(0.5);
    fabricCanvas.add(oImg).renderAll();
  });
}

function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files[0];
  const reader = new FileReader();

  reader.onload = (f) => {
    const data: string | ArrayBuffer = f.target.result;
    fabric.Image.fromURL(data as string, (img) => {
      const oImg = img.set({ left: 0, top: 0, angle: 0 }).scale(0.9);
      fabricCanvas.add(oImg).renderAll();
      fabricCanvas.setActiveObject(oImg);
    });
  };

  reader.readAsDataURL(file);
}

function toggleEditor(editing: boolean) {
  const editorPanel = document.getElementById("wysiwyg-editor-container");
  editorPanel.style.display = editing ? "block" : "none";
}

function resetStyles() {
  color = "black";
}

function toggleUploader(showUpload: boolean) {
  const editorPanel = document.getElementById("upload-pdf-wrapper");
  editorPanel.style.display = showUpload ? "block" : "none";
}

function removeCurrentPdf() {
  document.querySelector("#pdf-canvas-container > div:nth-child(1)").remove();
  const newCanvas = document.createElement("canvas");
  newCanvas.id = "pdf-canvas";
  document.getElementById("pdf-canvas-container").appendChild(newCanvas);
  toggleNavBar(false);
}

function toggleNavBar(showNavigation: boolean) {
  const navigationBar = document.getElementById("navigation");
  navigationBar.style.display = showNavigation ? "flex" : "none";
}

function formatBlock(size: string) {
  switch (size) {
    case "H1":
      updateStyles({ fontSize: 35 });
      break;
    case "H2":
      updateStyles({ fontSize: 30 });
      break;
    case "H3":
      updateStyles({ fontSize: 25 });
      break;
    default:
      break;
  }
}
