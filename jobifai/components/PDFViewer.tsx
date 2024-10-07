import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  onTextExtracted: (text: string) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, onTextExtracted }) => {
  const [numPages, setNumPages] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function onPageLoadSuccess(page: any) {
    const textContent = page.getTextContent();
    textContent.then((text: any) => {
      const pageText = text.items.map((item: any) => item.str).join(' ');
      onTextExtracted(pageText);
    });
  }

  return (
    <Document
      file={pdfUrl}
      onLoadSuccess={onDocumentLoadSuccess}
      options={{ workerSrc: '/pdf.worker.js' }}
    >
      {Array.from(new Array(numPages), (el, index) => (
        <Page 
          key={`page_${index + 1}`} 
          pageNumber={index + 1} 
          onLoadSuccess={onPageLoadSuccess}
        />
      ))}
    </Document>
  );
};

export default PDFViewer;