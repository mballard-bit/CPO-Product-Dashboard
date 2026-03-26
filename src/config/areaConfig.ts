import { ProductArea } from '../types';

const AREAS: ProductArea[] = [
  {
    id: 'benefits',
    name: 'Benefits',
    description: 'Benefits Administration — enrollment, plans, and admin approval',
    defaultEnabled: true,
    metricCards: [
      {
        label: 'Active Visitors',
        pendoType: 'pageVisitors',
        pendoIds: ['S-a6w3_UAYUvoDNIH7wH8v29NZ4'], // Benefits > Onboarding Module
        format: 'number',
        showTrend: true,
      },
      {
        label: 'Admin Approvals',
        pendoType: 'featureUsage',
        pendoIds: ['LjL6IfwYUFCdG4G-gjbLvnrcq5k'], // Benefits > Admin Approval ~ Vision Employee Pays
        format: 'number',
        showTrend: false,
      },
      {
        label: 'PES Score',
        pendoType: 'pes',
        pendoIds: [],
        format: 'score',
        showTrend: false,
      },
      {
        label: 'Active Accounts',
        pendoType: 'accounts',
        pendoIds: [],
        format: 'number',
        showTrend: true,
      },
    ],
    featureRows: [
      { label: 'Main Nav → Benefits', pendoType: 'feature', pendoId: 'pBRixPLIvjXyi8jHIqftnm-t0n8', metric: 'visitors' },
      { label: 'Admin Approval', pendoType: 'feature', pendoId: 'LjL6IfwYUFCdG4G-gjbLvnrcq5k', metric: 'visitors' },
      { label: 'Benefit History Details', pendoType: 'feature', pendoId: '6HJt7LJTV69lAL-iOuP4FPLBuiA', metric: 'visitors' },
      { label: 'Show Benefits History', pendoType: 'feature', pendoId: 'E18-Hc8CU2TxREOas9-zs569BOQ', metric: 'visitors' },
    ],
  },
  {
    id: 'time',
    name: 'Time & Attendance',
    description: 'Time tracking, timesheets, and kiosk usage',
    defaultEnabled: true,
    metricCards: [
      {
        label: 'Active Visitors',
        pendoType: 'pageVisitors',
        pendoIds: ['l2jUbQwltYUn2ncL0MYGshAshps'], // Time & Attendance (Main Navigation)
        format: 'number',
        showTrend: true,
      },
      {
        label: 'Nav Clicks',
        pendoType: 'featureUsage',
        pendoIds: ['2U8favqgL92hWg29KkxIVj1yNE0'], // Main Nav ~ Time & Attendance
        format: 'number',
        showTrend: false,
      },
      {
        label: 'PES Score',
        pendoType: 'pes',
        pendoIds: [],
        format: 'score',
        showTrend: false,
      },
      {
        label: 'Active Accounts',
        pendoType: 'accounts',
        pendoIds: [],
        format: 'number',
        showTrend: true,
      },
    ],
    featureRows: [
      { label: 'Main Nav → Time & Attendance', pendoType: 'feature', pendoId: '2U8favqgL92hWg29KkxIVj1yNE0', metric: 'visitors' },
      { label: 'Timesheets Tile', pendoType: 'feature', pendoId: 'oHrXyQlxY6wyM0dg4nOMyYmzzz8', metric: 'visitors' },
      { label: 'Hours Tile', pendoType: 'feature', pendoId: 'RJEjJj62J_sWBgC_WF7FrFb9bT8', metric: 'visitors' },
      { label: 'Hours In Payroll Tab', pendoType: 'feature', pendoId: 'vFd5m6U2tgYju3rWp8cDlxucZNo', metric: 'visitors' },
    ],
  },
  {
    id: 'payroll',
    name: 'Payroll',
    description: 'Payroll runs, approvals, and payment processing',
    defaultEnabled: true,
    metricCards: [
      {
        label: 'Payroll Runs Started',
        pendoType: 'featureUsage',
        pendoIds: ['GPDY0DjveiqPckv1aLcoVnC9Fuk'], // Payroll ~ Start Payroll
        format: 'number',
        showTrend: true,
      },
      {
        label: 'Payroll Runs Approved',
        pendoType: 'featureUsage',
        pendoIds: ['Nggav53kQOZY206G1tFlKs1HXNs'], // Payroll ~ Approve Payroll
        format: 'number',
        showTrend: true,
      },
      {
        label: 'PES Score',
        pendoType: 'pes',
        pendoIds: [],
        format: 'score',
        showTrend: false,
      },
      {
        label: 'Active Accounts',
        pendoType: 'accounts',
        pendoIds: [],
        format: 'number',
        showTrend: true,
      },
    ],
    featureRows: [
      { label: 'Start Payroll', pendoType: 'feature', pendoId: 'GPDY0DjveiqPckv1aLcoVnC9Fuk', metric: 'accounts' },
      { label: 'Approve Payroll', pendoType: 'feature', pendoId: 'Nggav53kQOZY206G1tFlKs1HXNs', metric: 'accounts' },
      { label: 'Payroll History', pendoType: 'feature', pendoId: '65h71yhfq-w9zJVakWij8HivPI4', metric: 'accounts' },
      { label: 'Fix Now (Employee Errors)', pendoType: 'feature', pendoId: 'BT0gI3oY8UdpucvL4DLYHsFc0Vs', metric: 'visitors' },
    ],
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Performance management and review cycles',
    defaultEnabled: true,
    metricCards: [
      {
        label: 'Active Visitors',
        pendoType: 'pageVisitors',
        pendoIds: ['PYu_XHeheNBtQs75q508FbBX90k'], // Employee > Performance Tab
        format: 'number',
        showTrend: true,
      },
      {
        label: 'Schedule Demo Clicks',
        pendoType: 'featureUsage',
        pendoIds: ['LFGSLegqnTmdOemFI8ei3wB9gvQ'], // Settings > Performance demo ~ Schedule Demo
        format: 'number',
        showTrend: false,
      },
      {
        label: 'PES Score',
        pendoType: 'pes',
        pendoIds: [],
        format: 'score',
        showTrend: false,
      },
      {
        label: 'Active Accounts',
        pendoType: 'accounts',
        pendoIds: [],
        format: 'number',
        showTrend: true,
      },
    ],
    featureRows: [
      { label: 'Performance Tab', pendoType: 'page', pendoId: 'PYu_XHeheNBtQs75q508FbBX90k', metric: 'visitors' },
      { label: 'Goals', pendoType: 'page', pendoId: 'nUUIiFiP7GbfMrlPrwzr-5YLu8c', metric: 'visitors' },
      { label: 'Assessment', pendoType: 'page', pendoId: 'dqLtp4qScPNwZFOloylXWEkr0zE', metric: 'visitors' },
      { label: 'Feedback', pendoType: 'page', pendoId: 'n8OT20n-C3poKiM9uNHIT9pGTfs', metric: 'visitors' },
    ],
  },
  {
    id: 'hiring',
    name: 'Hiring',
    description: 'Greenhouse ATS integration and hiring workflows',
    defaultEnabled: true,
    metricCards: [
      {
        label: 'Active Visitors',
        pendoType: 'pageVisitors',
        pendoIds: ['TTFNNUbg7btir1iARhlYqyqYS_g'], // Greenhouse > Dashboard
        format: 'number',
        showTrend: true,
      },
      {
        label: 'Payment Center Clicks',
        pendoType: 'featureUsage',
        pendoIds: ['bLDjPB0DpmX-EaNyfgjkeuGKXJo'], // Greenhouse > Payroll ~ Payment Center
        format: 'number',
        showTrend: false,
      },
      {
        label: 'PES Score',
        pendoType: 'pes',
        pendoIds: [],
        format: 'score',
        showTrend: false,
      },
      {
        label: 'Active Accounts',
        pendoType: 'accounts',
        pendoIds: [],
        format: 'number',
        showTrend: true,
      },
    ],
    featureRows: [
      { label: 'Greenhouse Dashboard', pendoType: 'page', pendoId: 'TTFNNUbg7btir1iARhlYqyqYS_g', metric: 'visitors' },
      { label: 'Payment Center', pendoType: 'feature', pendoId: 'bLDjPB0DpmX-EaNyfgjkeuGKXJo', metric: 'visitors' },
      { label: 'Potential Adjustments', pendoType: 'feature', pendoId: 'olEORizJvhiO-8GghDaoaLHI8Bg', metric: 'visitors' },
    ],
  },
  {
    id: 'people',
    name: 'People',
    description: 'Employee profiles, People tab, and HR core',
    defaultEnabled: true,
    metricCards: [
      {
        label: 'Active Visitors',
        pendoType: 'featureUsage',
        pendoIds: ['Pfpj_MEKedDmdL4_tJDEEulSLN8'], // Main Nav ~ Employees/People Tab
        format: 'number',
        showTrend: true,
      },
      {
        label: 'Reports Accessed',
        pendoType: 'pageVisitors',
        pendoIds: ['DwP-7_jaja_4FVRhR3WnX2s3jbs'], // Reports > All Report Sections
        format: 'number',
        showTrend: true,
      },
      {
        label: 'PES Score',
        pendoType: 'pes',
        pendoIds: [],
        format: 'score',
        showTrend: false,
      },
      {
        label: 'Active Accounts',
        pendoType: 'accounts',
        pendoIds: [],
        format: 'number',
        showTrend: true,
      },
    ],
    featureRows: [
      { label: 'Main Nav → People', pendoType: 'feature', pendoId: 'Pfpj_MEKedDmdL4_tJDEEulSLN8', metric: 'visitors' },
      { label: 'Standard Reports', pendoType: 'page', pendoId: 'p011cHh56kdX3XxpR1tsrnNgubU', metric: 'visitors' },
      { label: 'Custom Reports', pendoType: 'page', pendoId: 'CJhSmICbH88x0AbB9M2x9AZVr5k', metric: 'visitors' },
    ],
  },
];

export default AREAS;
