import { PDFDocumentProxy } from "pdfjs-dist";

// Global variables

// A map of canvas IDs to Fabric.js canvases
const fabricCanvases: { [id: string]: fabric.Canvas } = {};

const state: {
  isEditing: boolean;
  color: string;
  currentPageId: string;
  currentFabricCanvas: fabric.Canvas;
  pageCount: number;
  currentPDF: PDFDocumentProxy;
} = {
  isEditing: false,
  color: "black",
  currentPageId: null,
  currentFabricCanvas: undefined,
  pageCount: 0,
  currentPDF: null,
};

export { fabricCanvases, state };
