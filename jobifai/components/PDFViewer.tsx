import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { PDFPageProxy, TextContent, TextItem } from 'pdfjs-dist/types/src/display/api'; // Add this import

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

  function onPageLoadSuccess(page: PDFPageProxy) { // Specify the correct type for page
    const textContent = page.getTextContent();
    textContent.then((text: TextContent) => { // Specify the correct type for text
      const pageText = text.items
        .filter((item): item is TextItem => 'str' in item) // Type guard to filter items
        .map((item) => item.str) // Now item is guaranteed to be TextItem
        .join(' '); // Specify the type for item
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