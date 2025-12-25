import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportInvoicePdf(element, filename = "invoice.pdf") {
  // element: invoice container DOM
  const canvas = await html2canvas(element, {
    scale: 2, // kalite
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");

  // A4: 210x297 mm
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Canvas px -> mm oranı
  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = pageWidth;
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  } else {
    // Çok uzunsa sayfalara böl
    let y = 0;
    let remaining = imgHeight;

    while (remaining > 0) {
      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
      remaining -= pageHeight;
      if (remaining > 0) pdf.addPage();
      y -= pageHeight;
    }
  }

  pdf.save(filename);
}
