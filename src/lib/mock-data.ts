import { Customer, Invoice, Company } from './types';

export const mockCompany: Company = {
  name: 'EKO SOLAR LLC',
  address: '1018 Ferndale Street\nStone Mountain, GA, 30083',
  email: 'ekosolarze@gmail.com',
  phone: '(404) 551-6532',
  license: 'CM215202',
  ein: '83-3955336'
};

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Green Renewables',
    email: 'tj.knight@greenrenewables.com',
    phone: '(850) 964-4942',
    address: '281 Mountain Lake Road\nEllijay, GA, 30540',
    company: 'Green Renewables',
    contactPerson: 'Tj Knight'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@techcorp.com',
    phone: '(555) 987-6543',
    address: '456 Business Ave, Corporate City, ST 67890',
    company: 'Tech Corp Solutions',
    contactPerson: 'Sarah Johnson'
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'mike@startup.co',
    phone: '(555) 246-8135',
    address: '789 Innovation Dr, Startup Valley, ST 13579',
    company: 'Startup Innovations',
    contactPerson: 'Michael Brown'
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-000326',
    customerId: '1',
    customer: mockCustomers[0],
    status: 'Overdue',
    issueDate: '2025-05-03',
    dueDate: '2025-05-03',
    jobLocation: '281 Mountain Lake Road\nEllijay, GA, 30540',
    jobName: 'Solar Panel Installation',
    workOrderNumber: 'WO-2025-001',
    purchaseOrderNumber: 'PO-2025-001',
    invoiceType: 'Total Due',
    items: [
      {
        id: '1',
        description: 'Wireless breaker install X2',
        detailedDescription: 'Removal of old breaker installation of new Wi-Fi breaker rerouting of neutral wires to reach neutral ground bar relocation of moved breakers to make spaces for Wi-Fi breaker',
        quantity: 2,
        rate: 150,
        type: 'Service',
        taxRate: 0,
        discount: 0
      },
      {
        id: '2',
        description: 'Service call traveler fee',
        quantity: 1,
        rate: 350,
        type: 'Service',
        taxRate: 0,
        discount: 0
      }
    ],
    subtotal: 650,
    taxAmount: 0,
    discountAmount: 0,
    adjustment: 0,
    total: 650,
    terms: 'This document is a contract agreement between EKO SOLAR LLC. And',
    notes: 'Thank you for your business.',
    createdAt: '2025-05-03T10:00:00Z',
    updatedAt: '2025-05-03T10:00:00Z'
  },
  {
    id: '2',
    invoiceNumber: 'INV-202401-002',
    customerId: '2',
    customer: mockCustomers[1],
    status: 'Sent',
    issueDate: '2024-01-20',
    dueDate: '2024-02-19',
    invoiceType: 'Total Due',
    items: [
      {
        id: '3',
        description: 'SEO Optimization',
        quantity: 20,
        rate: 100,
        type: 'Service',
        taxRate: 8.5
      }
    ],
    subtotal: 2000,
    taxAmount: 170,
    discountAmount: 0,
    total: 2170,
    terms: 'Payment due within 30 days',
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z'
  },
  {
    id: '3',
    invoiceNumber: 'INV-202401-003',
    customerId: '3',
    customer: mockCustomers[2],
    status: 'Paid',
    issueDate: '2024-01-25',
    dueDate: '2024-02-25',
    invoiceType: 'Total Due',
    items: [
      {
        id: '4',
        description: 'Mobile App Development',
        quantity: 60,
        rate: 150,
        type: 'Service',
        taxRate: 8.5,
        discount: 10
      },
      {
        id: '5',
        description: 'App Store Submission',
        quantity: 2,
        rate: 99,
        type: 'Service',
        taxRate: 8.5
      }
    ],
    subtotal: 9198,
    taxAmount: 784.83,
    discountAmount: 900,
    total: 9082.83,
    terms: 'Payment due within 30 days',
    notes: 'Mobile app for iOS and Android platforms',
    createdAt: '2024-01-25T16:45:00Z',
    updatedAt: '2024-01-25T16:45:00Z'
  }
]; 