import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';

// Register fonts for better typography
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 11,
    paddingTop: 50,
    paddingLeft: 50,
    paddingRight: 50,
    paddingBottom: 50,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 5,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'right',
  },
  invoiceNumber: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 5,
  },
  billToSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  billToColumn: {
    flex: 1,
  },
  billToTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  billToText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableColDescription: {
    flex: 3,
  },
  tableColQuantity: {
    flex: 1,
    textAlign: 'center',
  },
  tableColRate: {
    flex: 1,
    textAlign: 'right',
  },
  tableColAmount: {
    flex: 1,
    textAlign: 'right',
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCellText: {
    fontSize: 11,
    color: '#6B7280',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalsTable: {
    width: 250,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  totalLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 11,
    color: '#374151',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
  },
  grandTotalValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#059669',
  },
  notesSection: {
    marginTop: 30,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 10,
    color: '#9CA3AF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
});

interface InvoiceData {
  invoiceId: string;
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
  customer?: {
    name: string;
    email: string;
    company?: string;
    address?: string;
    phone?: string;
  };
  lineItems?: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  issueDate?: string;
  dueDate?: string;
  description?: string;
  notes?: string;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  tax?: number;
  discount?: number;
}

interface InvoicePDFProps {
  invoice: InvoiceData;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, companyInfo }) => {
  const defaultCompanyInfo = {
    name: 'JOB INVOICER',
    address: '123 Business Street\nCity, State 12345',
    phone: '(555) 123-4567',
    email: 'info@jobinvoicer.com',
  };

  const company = companyInfo || defaultCompanyInfo;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{company.name}</Text>
            <Text style={styles.billToText}>{company.address}</Text>
            <Text style={styles.billToText}>{company.phone}</Text>
            <Text style={styles.billToText}>{company.email}</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoiceId}</Text>
          </View>
        </View>

        {/* Bill To Section */}
        <View style={styles.billToSection}>
          <View style={styles.billToColumn}>
            <Text style={styles.billToTitle}>BILL TO</Text>
            <Text style={styles.billToText}>{invoice.customer?.name || invoice.customerName}</Text>
            {invoice.customer?.company && (
              <Text style={styles.billToText}>{invoice.customer.company}</Text>
            )}
            {invoice.customer?.address && (
              <Text style={styles.billToText}>{invoice.customer.address}</Text>
            )}
            {invoice.customer?.email && (
              <Text style={styles.billToText}>{invoice.customer.email}</Text>
            )}
            {invoice.customer?.phone && (
              <Text style={styles.billToText}>{invoice.customer.phone}</Text>
            )}
          </View>
          <View style={styles.billToColumn}>
            <Text style={styles.billToTitle}>INVOICE DETAILS</Text>
            <Text style={styles.billToText}>Issue Date: {formatDate(invoice.issueDate || invoice.createdAt)}</Text>
            {invoice.dueDate && (
              <Text style={styles.billToText}>Due Date: {formatDate(invoice.dueDate)}</Text>
            )}
            <Text style={styles.billToText}>Status: {invoice.status}</Text>
          </View>
        </View>

        {/* Description */}
        {invoice.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Description</Text>
            <Text style={styles.billToText}>{invoice.description}</Text>
          </View>
        )}

        {/* Line Items Table */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Services & Products</Text>
          
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.tableColDescription}>
              <Text style={styles.tableHeaderText}>Description</Text>
            </View>
            <View style={styles.tableColQuantity}>
              <Text style={styles.tableHeaderText}>Qty</Text>
            </View>
            <View style={styles.tableColRate}>
              <Text style={styles.tableHeaderText}>Rate</Text>
            </View>
            <View style={styles.tableColAmount}>
              <Text style={styles.tableHeaderText}>Amount</Text>
            </View>
          </View>

          {/* Table Rows */}
          {invoice.lineItems?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableColDescription}>
                <Text style={styles.tableCellText}>{item.description}</Text>
              </View>
              <View style={styles.tableColQuantity}>
                <Text style={styles.tableCellText}>{item.quantity}</Text>
              </View>
              <View style={styles.tableColRate}>
                <Text style={styles.tableCellText}>{formatCurrency(item.rate)}</Text>
              </View>
              <View style={styles.tableColAmount}>
                <Text style={styles.tableCellText}>{formatCurrency(item.amount)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsTable}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal || invoice.amount)}</Text>
            </View>
            
            {invoice.tax && invoice.tax > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({invoice.tax}%):</Text>
                <Text style={styles.totalValue}>{formatCurrency(invoice.taxAmount || 0)}</Text>
              </View>
            )}
            
            {invoice.discount && invoice.discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount ({invoice.discount}%):</Text>
                <Text style={styles.totalValue}>-{formatCurrency(invoice.discountAmount || 0)}</Text>
              </View>
            )}
            
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total:</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(invoice.amount)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business! Payment is due within 30 days of invoice date.
        </Text>
      </Page>
    </Document>
  );
};

export { InvoicePDF };

// PDF Download Component
interface PDFDownloadButtonProps {
  invoice: InvoiceData;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  fileName?: string;
  children: React.ReactNode;
}

export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  invoice,
  companyInfo,
  fileName,
  children
}) => {
  const defaultFileName = `invoice-${invoice.invoiceId}.pdf`;
  
  return (
    <PDFDownloadLink
      document={<InvoicePDF invoice={invoice} companyInfo={companyInfo} />}
      fileName={fileName || defaultFileName}
    >
      {({ url, loading }) => (
        <div>
          {loading ? 'Generating PDF...' : children}
        </div>
      )}
    </PDFDownloadLink>
  );
}; 