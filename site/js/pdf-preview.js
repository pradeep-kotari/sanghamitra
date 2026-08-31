window.SMPdfPreview = (function () {
  const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  const WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  let loading = null;

  function ensurePdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (!loading) {
      loading = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = PDFJS;
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;
          resolve(window.pdfjsLib);
        };
        script.onerror = () => reject(new Error("Could not load PDF.js"));
        document.head.appendChild(script);
      });
    }
    return loading;
  }

  async function renderFirstPage(source, maxWidth = 480) {
    const pdfjs = await ensurePdfJs();
    let docSource;
    if (source instanceof Blob || source instanceof File) {
      docSource = { data: await source.arrayBuffer() };
    } else {
      docSource = { url: String(source), withCredentials: true };
    }

    const pdf = await pdfjs.getDocument(docSource).promise;
    const page = await pdf.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(maxWidth / base.width, 2);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({
      canvasContext: canvas.getContext("2d"),
      viewport,
    }).promise;
    return canvas;
  }

  async function renderFirstPageBlob(source, maxWidth = 480) {
    const canvas = await renderFirstPage(source, maxWidth);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  }

  async function renderFirstPageDataUrl(source, maxWidth = 480) {
    const canvas = await renderFirstPage(source, maxWidth);
    return canvas.toDataURL("image/jpeg", 0.82);
  }

  return { ensurePdfJs, renderFirstPageBlob, renderFirstPageDataUrl };
})();
