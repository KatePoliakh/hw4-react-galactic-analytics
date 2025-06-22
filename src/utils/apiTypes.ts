export interface AnalyticsResponse {
  total_spend_galactic: number;
  rows_affected: number;
  less_spent_at: number;
  big_spent_at: number;
  big_spent_value: number;
  average_spend_galactic: number;
  big_spent_civ: string;
  less_spent_civ: string;
}

export interface HighlightItem {
  title: string;
  description: string;
}

export interface HistoryItem {
  id: string;
  filename: string;
  date: string;
  success: boolean;
  highlights: HighlightItem[];
}

export interface GenerateReportParams {
  size: number;
  withErrors?: 'on' | 'off';
  maxSpend?: number;
}
