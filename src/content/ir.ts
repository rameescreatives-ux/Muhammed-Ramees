import { LEGACY_ORIGIN } from "./site";

/**
 * Investor Relations document library.
 *
 * Every entry is a real published document on unikai.com, with its actual
 * publication date as disclosed. These are regulatory filings for a
 * DFM-listed PJSC, so the list is reproduced exactly — no re-dating, no
 * re-titling, no omissions within each category.
 *
 * Documents stay on their existing URLs for now; they migrate to Supabase
 * Storage at content handover, at which point only this file changes.
 */

const D = `${LEGACY_ORIGIN}/wp-content/uploads`;

export interface IrDoc {
  title: string;
  date?: string;
  url: string;
  year: string;
}

export const financialStatements: IrDoc[] = [
  { title: "Financial statements — 30 June 2026", date: "2026-08-14", year: "2026", url: `${D}/2021/08/UNIKAI-FOODS-PJSC-CONSO-JUN-2026.pdf` },
  { title: "Financial statements — 31 March 2026", date: "2026-05-14", year: "2026", url: `${D}/2021/08/UNIKAI-FOODS-PJSC-CONSO-MAR-2026.pdf` },
  { title: "Financial statements — year ended 31 December 2025", date: "2026-03-17", year: "2025", url: `${D}/2021/08/UNIKAI-FOODS-CONSO-Dec-2025.pdf` },
  { title: "Preliminary results — 2025", date: "2026-02-13", year: "2025", url: `${D}/2021/08/Preliminary-Results-.pdf` },
  { title: "Financial statements — 30 September 2025", date: "2025-11-13", year: "2025", url: `${D}/2021/08/UNIKAI-FOODS-PJSC-CONSO-SEP-2025.pdf` },
  { title: "Financial statements — 30 June 2025", date: "2025-08-11", year: "2025", url: `${D}/2021/08/UNIKAI-FOODS-PJSC-Q2-2025.pdf` },
  { title: "Financial statements — 31 March 2025", date: "2025-05-13", year: "2025", url: `${D}/2021/08/UNIKAI-FOODS-PJSC-Q1-2025.pdf` },
  { title: "Financial statements — year ended 31 December 2024", date: "2025-03-20", year: "2024", url: `${D}/2021/08/UNIKAI-FOODS-PJSC-CONSO-DEC-2024.pdf` },
  { title: "Financial statements — 30 September 2024", date: "2024-11-13", year: "2024", url: `${D}/2021/08/UNIKAI-FOODS-PJSC-INTERIM-CONDENSED-CONSO-SEP-2024.pdf` },
  { title: "Financial statements — 30 June 2024", date: "2024-08-07", year: "2024", url: `${D}/2021/08/English-UNIKAI-FOODS-PJSC-INTERIM-CONDENSED-CONSO-JUN-2024.pdf` },
  { title: "Financial statements — 31 March 2024", date: "2024-05-15", year: "2024", url: `${D}/2021/08/UNIKAI-FOODS-PJSC-INTERIM-CONDENSED-CONSO-MAR-2024.pdf` },
  { title: "Financial statements — year ended 31 December 2023", date: "2024-02-29", year: "2023", url: `${D}/2021/08/Financial-statements-for-the-year-2023.pdf` },
  { title: "Financial statements — 30 September 2023", date: "2023-11-10", year: "2023", url: `${D}/2021/08/UNIKAI-FOODS-PJSC-SEP-2023.pdf` },
  { title: "Financial statements — 30 June 2023", date: "2023-08-04", year: "2023", url: `${D}/2021/08/UNIKAI_FS_30_Jun_2023_signed-English.pdf` },
  { title: "Financial statements — 31 March 2023", date: "2023-05-15", year: "2023", url: `${D}/2021/08/UNIKAI-FOODS-PJSC-INTERIM-CONSO-MAR-2023-1.pdf` },
  { title: "Financial statements — year ended 31 December 2022", date: "2023-03-21", year: "2022", url: `${D}/2021/08/UNIKAI_FS_2022_signed-English-Published-21-Mar-2023.pdf` },
  { title: "Financial statements — Q3 2022", date: "2022-11-22", year: "2022", url: `${D}/2021/08/Unikai-Foods-P.J.S.C-FS-30-09-2022-English.pdf` },
  { title: "Financial statements — Q2 2022", year: "2022", url: `${D}/2021/08/Q2-2022-english.pdf` },
  { title: "Financial statements — Q1 2022", year: "2022", url: `${D}/2021/08/Q1-2022-english.pdf` },
  { title: "Financial statements — year end 2021", year: "2021", url: `${D}/2021/08/YE2021-EN.pdf` },
  { title: "Financial statements — Q3 2021", year: "2021", url: `${D}/2021/08/Q321-EN.pdf` },
  { title: "Financial statements — Q2 2021", year: "2021", url: `${D}/2021/08/Q221-EN.pdf` },
  { title: "Financial statements — Q1 2021", year: "2021", url: `${D}/2021/08/Q121-EN.pdf` },
  { title: "Financial statements — year end 2020", year: "2020", url: `${D}/2021/08/2020-Year-End-Unikai-FS-English.pdf` },
  { title: "Financial statements — Q3 2020", year: "2020", url: `${D}/2021/08/2020-Signed-FS-Q-3-UNIKAI.pdf` },
  { title: "Financial statements — Q2 2020", year: "2020", url: `${D}/2021/08/2020-Signed-FS-Q-2-UNIKAI.pdf` },
  { title: "Financial statements — Q1 2020", year: "2020", url: `${D}/2021/08/2020-Signed-FS-Q-1-UNIKAI.pdf` },
  { title: "Financial statements — year end 2019", year: "2019", url: `${D}/2021/08/2019-Year-End-Unikai-FS-English-1.pdf` },
  { title: "Financial statements — Q3 2019", year: "2019", url: `${D}/2021/08/2019-Signed-FS-Q-3-UNIKAI-1.pdf` },
  { title: "Financial statements — Q2 2019", year: "2019", url: `${D}/2021/08/2019-Signed-FS-Q-2-UNIKAI-1.pdf` },
  { title: "Financial statements — Q1 2019", year: "2019", url: `${D}/2021/08/2019-Signed-FS-Q-1-UNIKAI-1.pdf` },
  { title: "Financial statements — year end 2018", year: "2018", url: `${D}/2021/08/2018-Year-End-Unikai-FS-English-1.pdf` },
  { title: "Financial statements — Q3 2018", year: "2018", url: `${D}/2021/08/2018-Q3-Unikai-FS-1.pdf` },
  { title: "Financial statements — Q2 2018", year: "2018", url: `${D}/2021/08/2018-Q2-Unikai-FS-1.pdf` },
  { title: "Financial statements — Q1 2018", year: "2018", url: `${D}/2021/08/2018-Q1-Unikai-FS-1.pdf` },
  { title: "Financial statements — year end 2017", year: "2017", url: `${D}/2021/08/2017-Year-End-Unikai-FS-1.pdf` },
  { title: "Financial statements — Q3 2017", year: "2017", url: `${D}/2021/08/2017-Q3-Unikai-FS-1.pdf` },
  { title: "Financial statements — Q2 2017", year: "2017", url: `${D}/2021/08/2017-Q2-Unikai-FS-1.pdf` },
  { title: "Financial statements — Q1 2017", year: "2017", url: `${D}/2021/08/2017-Q1-Unikai-FS-1.pdf` },
  { title: "Financial statements — year end 2016", year: "2016", url: `${D}/2021/08/2016-Year-End-Unikai-FS.pdf` },
  { title: "Financial statements — Q3 2016", year: "2016", url: `${D}/2021/08/2016-Q3-Unikai-FS.pdf` },
  { title: "Financial statements — Q2 2016", year: "2016", url: `${D}/2021/08/2016-Q2-Unikai-FS.pdf` },
  { title: "Financial statements — Q1 2016", year: "2016", url: `${D}/2021/08/2016-Q1-Unikai-FS.pdf` },
  { title: "Financial statements — year end 2015", year: "2015", url: `${D}/2021/08/2015-Year-End-Unikai-FS.pdf` },
  { title: "Financial statements — Q3 2015", year: "2015", url: `${D}/2021/08/2015-Q3-Unikai-FS.pdf` },
  { title: "Financial statements — Q2 2015", year: "2015", url: `${D}/2021/08/2015-Q2-Unikai-FS.pdf` },
  { title: "Financial statements — Q1 2015", year: "2015", url: `${D}/2021/08/2015-Q1-Unikai-FS.pdf` },
];

export const integratedReports: IrDoc[] = [
  { title: "Integrated Report 2025", date: "2026-03-17", year: "2025", url: `${D}/2022/03/Integrated-Reports-FY-2025_Batch-Compress.pdf` },
  { title: "Integrated Report 2024", date: "2025-03-23", year: "2024", url: `${D}/2022/03/Integrated-Reports-FY-2024_EN.pdf` },
  { title: "Integrated Report 2023", date: "2024-03-04", year: "2023", url: `${D}/2022/03/Integrated-Reports-2023-1.pdf` },
  { title: "Integrated Report 2022", date: "2023-03-23", year: "2022", url: `${D}/2022/03/Integrated-Reports-2023.pdf` },
  { title: "Integrated Report 2021", year: "2021", url: `${D}/2022/03/Integrated-Reports-2021.pdf` },
];

export const annualReports: IrDoc[] = [
  { title: "Annual Report 2019", year: "2019", url: `${D}/2021/08/2019-ENG.pdf` },
  { title: "Annual Report 2018", year: "2018", url: `${D}/2021/08/2018-ENG.pdf` },
  { title: "Annual Report 2017", year: "2017", url: `${D}/2021/08/2017-ENG.pdf` },
  { title: "Annual Report 2016", year: "2016", url: `${D}/2021/08/2016-ENG-1.pdf` },
  { title: "Annual Report 2015", year: "2015", url: `${D}/2021/08/2015-ENG.pdf` },
];

export const otherReports: IrDoc[] = [
  { title: "Sustainability Report 2020", year: "2020", url: `${D}/2021/08/Unikai-Sustainability-Report-2020.pdf` },
  { title: "Strategic Plan", year: "—", url: `${D}/2021/08/Strategic-Plan.pdf` },
];
