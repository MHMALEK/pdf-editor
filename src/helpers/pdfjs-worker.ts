import * as pdfjsLib from "pdfjs-dist";

function initializePDFjsWorker() {
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    const WORKER_URL = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
  }
}

export { initializePDFjsWorker };
