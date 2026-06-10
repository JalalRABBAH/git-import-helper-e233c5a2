export enum ReportPeriod {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  GENERATING = 'GENERATING',
  READY = 'READY',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  AMENDMENT_REQUIRED = 'AMENDMENT_REQUIRED',
}

export enum ReportFormat {
  XML_UEMOA = 'XML_UEMOA',
  PDF_SIGNED = 'PDF_SIGNED',
  CSV = 'CSV',
  JSON = 'JSON',
}
