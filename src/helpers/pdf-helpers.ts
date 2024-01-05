import * as pdfjsLib from "pdfjs-dist";
import { fabric } from "fabric";
import { fabricCanvases, state } from "../globals";
import { jsPDF } from "jspdf";

async function getPageDimensions(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number
) {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  return { width: viewport.width, height: viewport.height };
}
async function addPageToPDF() {
  if (state.currentPDF) {
    // Get the first page to use as a reference for the size
    const referencePage = await state.currentPDF.getPage(1);

    // Get the device pixel ratio
    let devicePixelRatio = window.devicePixelRatio || 1;

    // Get viewport based on the devicePixelRatio
    const viewport = referencePage.getViewport({ scale: devicePixelRatio });

    // Create a new canvas element
    const canvasId = "pdf-canvas-" + (state.pageCount + 1);
    const canvas = document.createElement("canvas");
    canvas.id = canvasId;

    // Adjust the canvas size based on the devicePixelRatio
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.style.width = `${viewport.width / devicePixelRatio}px`;
    canvas.style.height = `${viewport.height / devicePixelRatio}px`;

    // Append the div to the document body or any other container
    document.getElementById("pdf-canvas-container").appendChild(canvas);

    state.pageCount++;
    state.currentPageId = "pdf-canvas-" + state.pageCount;
  } else {
    console.log("No PDF selected");
  }
}
function removePageFromPDF() {
  if (
    state.currentPageId &&
    state.currentPDF &&
    state.currentPDF.numPages > 0
  ) {
    const canvasToRemove = fabricCanvases[state.currentPageId];
    canvasToRemove.dispose();
    delete fabricCanvases[state.currentPageId];

    // Remove the corresponding HTML canvas element from the DOM
    const canvasElement = document.getElementById(state.currentPageId);
    canvasElement.parentNode.removeChild(canvasElement);

    state.pageCount--; // Decrement state.pageCount

    // Re-index page IDs for all the pages that come after the removed page
    const removedPageNumber = parseInt(
      state.currentPageId.replace("pdf-canvas-", "")
    );
    for (let i = removedPageNumber + 1; i <= state.pageCount + 1; i++) {
      const oldCanvasId = "pdf-canvas-" + i;
      const newCanvasId = "pdf-canvas-" + (i - 1);

      // Update fabric canvases map
      fabricCanvases[newCanvasId] = fabricCanvases[oldCanvasId];
      delete fabricCanvases[oldCanvasId];

      // Update HTML canvas element ID
      const canvasElement = document.getElementById(oldCanvasId);
      canvasElement.id = newCanvasId;
    }

    // Set state.currentPageId to the previous page if it exists
    if (state.pageCount > 0) {
      state.currentPageId = "pdf-canvas-" + state.pageCount;
    } else {
      state.currentPageId = null;
    }
  } else {
    console.log("No page selected or PDF has no pages");
  }
}

async function createNewPDF() {
  if (!state.currentPDF) {
    state.pageCount = 1;
    const canvasId = "pdf-canvas-" + state.pageCount;
    const canvas = document.createElement("canvas");
    canvas.id = canvasId;

    // Set the size of the canvas to A4 size at 72 DPI
    canvas.width = 595;
    canvas.height = 842;

    document.getElementById("pdf-canvas-container").appendChild(canvas);
  } else {
    console.log("A PDF is already selected");
  }
}

function handlePageClick(fabricCanvasId: string) {
  state.currentPageId = fabricCanvasId;

  state.currentFabricCanvas = fabricCanvases[state.currentPageId];
  document.querySelectorAll("[data-selected='true']").forEach((el) => {
    // @ts-ignore
    el.dataset["selected"] = "false";
  });
  document.getElementById(state.currentPageId).dataset["selected"] = "true";
}

// Add text to the current page
function addText() {
  if (state.currentPageId) {
    const fabricCanvas = fabricCanvases[state.currentPageId];
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
  if ((e.keyCode === 46 || e.keyCode === 8) && !state.isEditing) {
    const activeObject = state.currentFabricCanvas.getActiveObject();
    if (activeObject) {
      state.currentFabricCanvas.remove(activeObject);
    }
  }
}

function updateStyles(items?: any) {
  const activeObject = state.currentFabricCanvas.getActiveObject();
  if (activeObject) {
    activeObject.set({
      // @ts-ignore
      fontSize: items?.fontSize
        ? parseInt(items?.fontSize)
        : parseInt(
            (document.getElementById("font-size") as HTMLInputElement).value
          ),
      fill: state.color,
      fontFamily: (document.getElementById("font-family") as HTMLInputElement)
        .value,
      fontWeight: items?.bold ? "bold" : "normal",
      fontStyle: items?.italic ? "italic" : "normal",
    });

    state.currentFabricCanvas.renderAll();
    toggleEditor(true);
  }
}

function loadImage() {
  const imageUrl = (document.getElementById("imageUrl") as HTMLInputElement)
    .value;

  fabric.Image.fromURL(imageUrl, (img) => {
    const oImg = img.set({ left: 0, top: 0, angle: 0 }).scale(0.5);
    state.currentFabricCanvas.add(oImg).renderAll();
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
      if (state.currentPageId) {
        const fabricCanvas = fabricCanvases[state.currentPageId];
        fabricCanvas.add(oImg).renderAll();
        fabricCanvas.setActiveObject(oImg);
        // Highlight the selected canvas
        document.getElementById(state.currentPageId).classList.add("selected");
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

function resetStyles() {
  state.color = "black";
}

function toggleEditor(editing: boolean) {
  const editorPanel = document.getElementById("wysiwyg-editor-container");
  editorPanel.style.display = editing ? "block" : "none";
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

function toggleNavBar(showNavigation: boolean) {
  const navigationBar = document.getElementById("navigation");
  navigationBar.style.display = showNavigation ? "flex" : "none";
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

// Helper functions
async function handlePDFUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files[0];
  const reader = new FileReader();

  reader.onload = async (event) => {
    const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
    // Load the PDF file
    const pdf = await pdfjsLib.getDocument({ data: typedarray.buffer }).promise;
    state.currentPDF = pdf; // Store the uploaded PDF

    // Render each page of the PDF file
    for (let i = 1; i <= pdf.numPages; i++) {
      const canvasId = "pdf-canvas-" + i;
      const canvas = await renderPDF(pdf, canvasId, i);
      createFabricCanvas(canvas, canvasId);
      state.pageCount++; // Increment state.pageCount
      toggleUploader(false);
    }
  };

  reader.readAsArrayBuffer(file);
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

function createFabricCanvas(canvas: HTMLCanvasElement, fabricCanvasId: string) {
  const canvasImg = canvas.toDataURL();

  const fabricCanvas = new fabric.Canvas(fabricCanvasId, {
    isDrawingMode: false,
    backgroundColor: "white",
  });

  fabricCanvases[fabricCanvasId] = fabricCanvas;

  fabricCanvas.on("text:editing:entered", () => {
    state.isEditing = true;
    setTimeout(() => {
      toggleEditor(true);
    }, 400);
  });

  fabricCanvas.on("text:editing:exited", () => {
    state.isEditing = false;
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

export {
  getPageDimensions,
  addPageToPDF,
  removePageFromPDF,
  createNewPDF,
  handlePageClick,
  addText,
  deleteActiveObject,
  updateStyles,
  loadImage,
  handleImageUpload,
  resetStyles,
  toggleEditor,
  formatBlock,
  savePDF,
  toggleNavBar,
  toggleUploader,
  removeCurrentPdf,
  handlePDFUpload,
  renderPDF,
  createFabricCanvas,
};
