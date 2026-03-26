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
        pendoIds: ['C8Oue8IOfwvGtEX41S6FZG2WaAE'], // Employee Profile > Benefits Tab
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
      { label: 'Benefits Home Page', pendoType: 'page', pendoId: 'HEfPp9RkNTVx1SfYpL3ATytOlGc', metric: 'visitors' },
      { label: 'Benefit History Details', pendoType: 'feature', pendoId: '6HJt7LJTV69lAL-iOuP4FPLBuiA', metric: 'visitors' },
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
        pendoIds: ['PSc2cz8erT4i67QDQ-Ll1fZiKew'], // My Info > Timesheet Tab
        format: 'number',
        showTrend: true,
      },
      {
        label: 'Timesheets Tile Clicks',
        pendoType: 'featureUsage',
        pendoIds: ['oHrXyQlxY6wyM0dg4nOMyYmzzz8'], // Timesheets Tile
        format: 'number',
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
      { label: 'Timesheets Tile', pendoType: 'feature', pendoId: 'oHrXyQlxY6wyM0dg4nOMyYmzzz8', metric: 'visitors' },
      { label: 'My Info Timesheet Tab', pendoType: 'page', pendoId: 'PSc2cz8erT4i67QDQ-Ll1fZiKew', metric: 'visitors' },
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
    description: 'BambooHR Hiring — job openings, candidates, and applicant tracking',
    defaultEnabled: true,
    metricCards: [
      {
        label: 'Active Visitors',
        pendoType: 'pageVisitors',
        pendoIds: ['BX9H5KpMgKIi1Ou0u8jbaNJiSmg'], // Hiring > General (catch-all)
        format: 'number',
        showTrend: true,
      },
      {
        label: 'Nav Clicks',
        pendoType: 'featureUsage',
        pendoIds: ['WL_VhRPrJS1oHxr6jS8eAc3VMfM'], // Main Nav ~ Hiring
        format: 'number',
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
      { label: 'Hiring Overview', pendoType: 'page', pendoId: 'BX9H5KpMgKIi1Ou0u8jbaNJiSmg', metric: 'visitors' },
      { label: 'Job Openings', pendoType: 'page', pendoId: 'cVOBtmA4CP3GWCDyPB4-pVzKKU4', metric: 'visitors' },
      { label: 'Candidates Tab', pendoType: 'page', pendoId: 'sgRCxFblsq9dthtIWR7-cnZS6EA', metric: 'visitors' },
      { label: 'Add Job Opening', pendoType: 'feature', pendoId: 'HvXG7X32ThvBsvHbksvHEgHqDaA', metric: 'visitors' },
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
  {
    id: 'global-employment',
    name: 'Global Employment',
    description: 'Employer of Record (EOR) integration with Remote — global hiring and compliance',
    defaultEnabled: true,
    metricCards: [
      {
        label: 'Marketing Page Visitors',
        pendoType: 'pageVisitors',
        pendoIds: ['7OXzvl3RCCqrYuY_vjhmMsM-oIw'], // Settings > Global Employment (Marketing Page)
        format: 'number',
        showTrend: true,
      },
      {
        label: 'Marketing Cost Calculator',
        pendoType: 'featureUsage',
        pendoIds: ['TV0QMAVkj9KlCcugrEiuZsHKTUc'], // Settings > Global Employment ~ Calculate
        format: 'number',
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
      { label: 'Nav → Global Employment', pendoType: 'feature', pendoId: 'v-mP2n8WvWdP3Y7qnuCyEyW4Rjk', metric: 'visitors' },
      { label: 'Marketing Page', pendoType: 'page', pendoId: '7OXzvl3RCCqrYuY_vjhmMsM-oIw', metric: 'visitors' },
      { label: 'Marketing Cost Calculator', pendoType: 'feature', pendoId: 'TV0QMAVkj9KlCcugrEiuZsHKTUc', metric: 'visitors' },
      { label: 'Full Breakdown Calculator', pendoType: 'feature', pendoId: 'tK4W_hUKy8VP_rFN52l2rftbeF0', metric: 'visitors' },
    ],
    trendCharts: [
      { label: 'Marketing Cost Calculator', type: 'feature', id: 'TV0QMAVkj9KlCcugrEiuZsHKTUc', metric: 'visitors' },
      { label: 'Full Breakdown Calculator', type: 'feature', id: 'tK4W_hUKy8VP_rFN52l2rftbeF0', metric: 'visitors' },
      { label: 'Demos Scheduled', type: 'feature', id: 'nEnmohV70aoH4r5GMzQAU1cZ9fs', metric: 'visitors' },
      { label: 'EOR Installs', type: 'feature', id: '-_63CskKTL0BsCkfu-qBAejZEIE', metric: 'visitors' },
      { label: 'New EOR Employee', type: 'page', id: 'iuC9Z3SrL-R35o63bHjbpEJIid4', metric: 'visitors' },
    ],
    // Use marketing page visitors as denominator so bars show funnel conversion rates
    featureBarBase: { type: 'page', id: '7OXzvl3RCCqrYuY_vjhmMsM-oIw' },
  },
];

export default AREAS;
