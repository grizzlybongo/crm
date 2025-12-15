import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces';
import { IInvoice } from '../models/Invoice';
import { IUser } from '../types';

// Define custom fonts for the PDF using standard fonts (which don't require physical files)
const fonts: TFontDictionary = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

// Initialize PDF printer
const printer = new PdfPrinter(fonts);

/**
 * Format a date as DD/MM/YYYY
 */
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('fr-FR');
};

/**
 * Format a number as currency
 */
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' TND';
};

/**
 * Generate PDF for an invoice
 */
export const generateInvoicePdf = async (invoice: IInvoice, client: IUser): Promise<Buffer> => {
  // Define document content
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    header: {
      columns: [
        {
          text: 'FACTURE',
          alignment: 'right',
          margin: [0, 20, 40, 0],
          fontSize: 28,
          bold: true,
          color: '#2d8cff'
        }
      ]
    },
    content: [
      // Company Info
      {
        columns: [
          {
            stack: [
              { text: 'CMT', fontSize: 22, bold: true },
              { text: 'Consulting Management Tunisia', fontSize: 14 },
              { text: '123 Avenue Habib Bourguiba', fontSize: 10 },
              { text: 'Tunis, Tunisie', fontSize: 10 },
              { text: 'Tel: +216 71 123 456', fontSize: 10 },
              { text: 'Email: contact@cmt-tunisia.com', fontSize: 10 },
              { text: 'MF: 123456789', fontSize: 10 }
            ],
            width: '50%'
          },
          {
            stack: [
              { text: `Facture N°: ${invoice.number}`, fontSize: 12, bold: true },
              { text: `Date: ${formatDate(invoice.date)}`, fontSize: 10 },
              { text: `Échéance: ${formatDate(invoice.dueDate)}`, fontSize: 10 },
              { text: '\n' },
              { text: `État: ${getStatusText(invoice.status)}`, fontSize: 12, bold: true, color: getStatusColor(invoice.status) }
            ],
            width: '50%',
            alignment: 'right'
          }
        ],
        margin: [0, 20, 0, 30]
      },

      // Client Info
      {
        stack: [
          { text: 'FACTURER À', fontSize: 14, bold: true, margin: [0, 0, 0, 5] },
          { text: client.name, fontSize: 12, bold: true },
          { text: client.company || '', fontSize: 10 },
          { text: client.address || '', fontSize: 10 },
          { text: client.phone || '', fontSize: 10 },
          { text: `Email: ${client.email}`, fontSize: 10 }
        ],
        margin: [0, 0, 0, 30]
      },

      // Table for items
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Description', style: 'tableHeader' },
              { text: 'Quantité', style: 'tableHeader', alignment: 'right' },
              { text: 'Prix unitaire', style: 'tableHeader', alignment: 'right' },
              { text: 'Total', style: 'tableHeader', alignment: 'right' }
            ],
            // Add invoice items
            ...invoice.items.map(item => [
              { text: item.description },
              { text: item.quantity.toString(), alignment: 'right' },
              { text: formatCurrency(item.unitPrice), alignment: 'right' },
              { text: formatCurrency(item.total), alignment: 'right' }
            ])
          ]
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0,
          vLineWidth: () => 0,
          hLineColor: () => '#DDDDDD',
          paddingTop: () => 8,
          paddingBottom: () => 8
        }
      },

      // Totals
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            table: {
              widths: ['*', 'auto'],
              body: [
                [
                  { text: 'Sous-total HT', bold: true, border: [0, 0, 0, 0] },
                  { text: formatCurrency(invoice.subtotal), alignment: 'right', border: [0, 0, 0, 0] }
                ],
                [
                  { text: 'TVA (20%)', bold: true, border: [0, 0, 0, 0] },
                  { text: formatCurrency(invoice.tax), alignment: 'right', border: [0, 0, 0, 0] }
                ],
                [
                  { text: 'Total TTC', bold: true, fontSize: 13, border: [0, 0, 0, 0] },
                  { text: formatCurrency(invoice.total), bold: true, fontSize: 13, alignment: 'right', border: [0, 0, 0, 0] }
                ]
              ]
            },
            layout: {
              hLineWidth: (i: number) => (i === 0 || i === 3) ? 0 : 1,
              vLineWidth: () => 0,
              hLineColor: () => '#DDDDDD',
              paddingTop: () => 6,
              paddingBottom: () => 6
            },
            margin: [0, 20, 0, 0]
          }
        ]
      },

      // Notes
      invoice.notes ? {
        stack: [
          { text: 'Notes', bold: true, margin: [0, 30, 0, 10] },
          { text: invoice.notes || '' }
        ]
      } : { text: '' },

      // Payment Instructions
      {
        stack: [
          { text: 'Modalités de paiement', bold: true, margin: [0, 30, 0, 10] },
          { text: 'Veuillez effectuer le paiement dans les délais indiqués.' },
          { text: 'Coordonnées bancaires:' },
          { text: 'Banque: XYZ Bank' },
          { text: 'IBAN: TN59 1234 5678 9012 3456 7890' },
          { text: 'BIC: XYZBTUN1' }
        ],
        margin: [0, 10, 0, 0]
      }
    ],
    footer: {
      columns: [
        {
          text: 'CMT - Consulting Management Tunisia | MF: 123456789 | RC: B123456789',
          alignment: 'center',
          fontSize: 8,
          margin: [40, 0, 40, 0]
        }
      ]
    },
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: '#333333',
        fillColor: '#EEEEEE'
      }
    },
    defaultStyle: {
      font: 'Roboto'
    }
  };

  // Generate PDF
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  
  return new Promise((resolve, reject) => {
    try {
      const chunks: Uint8Array[] = [];
      pdfDoc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Helper functions for invoice status
const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    draft: 'BROUILLON',
    sent: 'ENVOYÉE',
    paid: 'PAYÉE',
    overdue: 'EN RETARD',
    cancelled: 'ANNULÉE',
  };
  return texts[status] || status.toUpperCase();
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: '#9E9E9E',
    sent: '#2196F3',
    paid: '#4CAF50',
    overdue: '#F44336',
    cancelled: '#F44336',
  };
  return colors[status] || '#000000';
}; 