import { fabric } from "fabric";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";
import "@simonwep/pickr/dist/themes/classic.min.css";
import Pickr from "@simonwep/pickr";

// Global variables
let isEditing = false;
let color = "black";
let currentPageId: string = null;
// A map of canvas IDs to Fabric.js canvases
const fabricCanvases: { [id: string]: fabric.Canvas } = {};
let currentFabricCanvas: any;
let pageCount = 0;
let currentPDF: pdfjsLib.PDFDocumentProxy = null;

// Create a color picker
const colorPicker = createColorPicker(".color-picker");

// Ensure pdfjs worker is initialized
initializePDFjsWorker();

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
async function handlePDFUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files[0];
  const reader = new FileReader();

  reader.onload = async (event) => {
    const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
    // Load the PDF file
    const pdf = await pdfjsLib.getDocument({ data: typedarray.buffer }).promise;
    currentPDF = pdf; // Store the uploaded PDF
    setupEventListeners();

    // Render each page of the PDF file
    for (let i = 1; i <= pdf.numPages; i++) {
      const canvasId = "pdf-canvas-" + i;
      const canvas = await renderPDF(pdf, canvasId, i);
      createFabricCanvas(canvas, canvasId);
      pageCount++; // Increment pageCount
      toggleUploader(false);
    }
  };

  reader.readAsArrayBuffer(file);
}
async function getPageDimensions(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number
) {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  return { width: viewport.width, height: viewport.height };
}
async function addPageToPDF() {
  if (currentPDF) {
    console.log(currentPDF, pageCount);

    // Get the first page to use as a reference for the size
    const referencePage = await currentPDF.getPage(1);

    // Get the device pixel ratio
    let devicePixelRatio = window.devicePixelRatio || 1;

    // Get viewport based on the devicePixelRatio
    const viewport = referencePage.getViewport({ scale: devicePixelRatio });

    // Create a new canvas element
    const canvasId = "pdf-canvas-" + (pageCount + 1);
    const canvas = document.createElement("canvas");
    canvas.id = canvasId;

    // Adjust the canvas size based on the devicePixelRatio
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.style.width = `${viewport.width / devicePixelRatio}px`;
    canvas.style.height = `${viewport.height / devicePixelRatio}px`;

    // Append the div to the document body or any other container
    document.getElementById("pdf-canvas-container").appendChild(canvas);

    createFabricCanvas(canvas, canvasId);
    pageCount++;
    currentPageId = "pdf-canvas-" + pageCount;
  } else {
    console.log("No PDF selected");
  }
}
function removePageFromPDF() {
  if (currentPageId && currentPDF && currentPDF.numPages > 0) {
    const canvasToRemove = fabricCanvases[currentPageId];
    canvasToRemove.dispose();
    delete fabricCanvases[currentPageId];

    // Remove the corresponding HTML canvas element from the DOM
    const canvasElement = document.getElementById(currentPageId);
    canvasElement.parentNode.removeChild(canvasElement);

    pageCount--; // Decrement pageCount

    // Re-index page IDs for all the pages that come after the removed page
    const removedPageNumber = parseInt(
      currentPageId.replace("pdf-canvas-", "")
    );
    for (let i = removedPageNumber + 1; i <= pageCount + 1; i++) {
      const oldCanvasId = "pdf-canvas-" + i;
      const newCanvasId = "pdf-canvas-" + (i - 1);

      // Update fabric canvases map
      fabricCanvases[newCanvasId] = fabricCanvases[oldCanvasId];
      delete fabricCanvases[oldCanvasId];

      // Update HTML canvas element ID
      const canvasElement = document.getElementById(oldCanvasId);
      canvasElement.id = newCanvasId;
    }

    // Set currentPageId to the previous page if it exists
    if (pageCount > 0) {
      currentPageId = "pdf-canvas-" + pageCount;
    } else {
      currentPageId = null;
    }
  } else {
    console.log("No page selected or PDF has no pages");
  }
}

async function createNewPDF() {
  if (!currentPDF) {
    pageCount = 1;
    const canvasId = "pdf-canvas-" + pageCount;
    const canvas = document.createElement("canvas");
    canvas.id = canvasId;

    // Set the size of the canvas to A4 size at 72 DPI
    canvas.width = 595;
    canvas.height = 842;

    document.getElementById("pdf-canvas-container").appendChild(canvas);
    createFabricCanvas(canvas, canvasId);
  } else {
    console.log("A PDF is already selected");
  }
}

async function renderPDF(
  pdf: pdfjsLib.PDFDocumentProxy,
  canvasId: string,
  pageNumber: number
) {
  const page = await pdf.getPage(pageNumber);

  // Get the device pixel ratio
  let devicePixelRatio = window.devicePixelRatio || 1;

  // Get viewport based on the devicePixelRatio
  const viewport = page.getViewport({ scale: devicePixelRatio });

  // Create a new canvas element
  const canvas = document.createElement("canvas");
  canvas.id = canvasId;

  const context = canvas.getContext("2d");

  // Adjust the canvas size based on the devicePixelRatio
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  canvas.style.width = `${viewport.width / devicePixelRatio}px`;
  canvas.style.height = `${viewport.height / devicePixelRatio}px`;

  // Append the div to the document body or any other container
  document.getElementById("pdf-canvas-container").appendChild(canvas);

  // Render the page
  await page.render({ canvasContext: context, viewport }).promise;

  return canvas;
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

function createFabricCanvas(canvas: HTMLCanvasElement, fabricCanvasId: string) {
  console.log("asdasd");
  const canvasImg = canvas.toDataURL();

  const fabricCanvas = new fabric.Canvas(fabricCanvasId, {
    isDrawingMode: false,
    backgroundColor: "white",
  });

  fabricCanvases[fabricCanvasId] = fabricCanvas;

  fabricCanvas.on("text:editing:entered", () => {
    isEditing = true;
    setTimeout(() => {
      toggleEditor(true);
    }, 400);
  });

  fabricCanvas.on("text:editing:exited", () => {
    isEditing = false;
    resetStyles();
    setTimeout(() => {
      toggleEditor(false);
    }, 400);
  });

  fabricCanvas.on("mouse:down", () => {
    handlePageClick(fabricCanvasId);
  });

  fabric.Image.fromURL(canvasImg, (img) => {
    img.selectable = false;
    fabricCanvas.add(img);
  });

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
  // Instantiate a new jsPDF object in A4 size
  const pdf = new jsPDF();

  // @ts-ignore
  const allCanvasesPromises = Object.values(fabricCanvases).map(
    (canvas: fabric.Canvas) =>
      canvas.toDataURL({ format: "jpeg", multiplier: 1 })
  );

  Promise.all(allCanvasesPromises).then((allCanvasDataUrls: string[]) => {
    allCanvasDataUrls.forEach((dataUrl: string, i: number) => {
      // @ts-ignore
      const canvas = Object.values(fabricCanvases)[i];
      const width = canvas.getWidth();
      const height = canvas.getHeight();

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      let scale = 1;
      // Check if the width of the image is larger than the page.
      if (width > pdfWidth) {
        scale = pdfWidth / width;
      }
      // Check if the height of the image is larger than the page.
      if (height > pdfHeight) {
        scale = Math.min(scale, pdfHeight / height);
      }

      pdf.addImage(
        dataUrl,
        "jpeg",
        0,
        0,
        width * scale,
        height * scale,
        undefined,
        "MEDIUM"
      );

      // Add a new page for the next canvas unless this is the last canvas
      if (i < allCanvasDataUrls.length - 1) {
        pdf.addPage();
      }
    });

    pdf.save("document.pdf");
  });
}

function handlePageClick(fabricCanvasId: string) {
  currentPageId = fabricCanvasId;

  currentFabricCanvas = fabricCanvases[currentPageId];
  document.querySelectorAll("[data-selected='true']").forEach((el) => {
    // @ts-ignore
    el.dataset["selected"] = "false";
  });
  document.getElementById(currentPageId).dataset["selected"] = "true";
}

// Add text to the current page
function addText() {
  if (currentPageId) {
    const fabricCanvas = fabricCanvases[currentPageId];
    const text = new fabric.IText("Hello, world!", {
      left: 100,
      top: 100,
      fontSize: 30,
    });
    fabricCanvas.add(text);
  } else {
    // @ts-ignore
    // it's been added via CDN
    Snackbar.show({
      pos: "top-center",
      text: "هیچ صفحه‌ای انتخاب نشده است. لطفا ابتدا صفحه مورد نظر را با کلیک بر روی آن انتخاب نمایید.",
    }); //Set the position
  }
}

function deleteActiveObject(e: KeyboardEvent) {
  if ((e.keyCode === 46 || e.keyCode === 8) && !isEditing) {
    const activeObject = currentFabricCanvas.getActiveObject();
    if (activeObject) {
      currentFabricCanvas.remove(activeObject);
    }
  }
}

function updateStyles(items?: any) {
  const activeObject = currentFabricCanvas.getActiveObject();
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

    currentFabricCanvas.renderAll();
    toggleEditor(true);
  }
}

function loadImage() {
  const imageUrl = (document.getElementById("imageUrl") as HTMLInputElement)
    .value;

  fabric.Image.fromURL(imageUrl, (img) => {
    const oImg = img.set({ left: 0, top: 0, angle: 0 }).scale(0.5);
    currentFabricCanvas.add(oImg).renderAll();
  });
}

function handleImageUpload(e: Event) {
  const fileInput = e.target as HTMLInputElement;
  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = (f) => {
    const data: string | ArrayBuffer = f.target.result;
    fabric.Image.fromURL(data as string, (img) => {
      const oImg = img.set({ left: 0, top: 0, angle: 0 }).scale(0.9);
      if (currentPageId) {
        const fabricCanvas = fabricCanvases[currentPageId];
        fabricCanvas.add(oImg).renderAll();
        fabricCanvas.setActiveObject(oImg);
        // Highlight the selected canvas
        document.getElementById(currentPageId).classList.add("selected");
      } else {
        // @ts-ignore
        Snackbar.show({
          pos: "top-center",
          text: "هیچ صفحه‌ای انتخاب نشده است. لطفا ابتدا صفحه مورد نظر را با کلیک بر روی آن انتخاب نمایید.",
        }); //Set the position
      }
    });
    // Reset the file input element
    fileInput.value = "";
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
