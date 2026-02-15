export interface User {
  id: number;
  full_name: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
}

export interface CustomerGroup {
  id: number;
  group_code: string;
  group_name: string;
  description: string;
  manager?: User;
}

export interface Customer {
  id: number;
  customer_code: string;
  account_number?: string;
  full_name: string;
  address: string;
  phone?: string;
  meter_number: string;
  group_id: number;
  group?: CustomerGroup;
}

export interface MeterReading {
  id: number;
  customer_id: number;
  reading_month: string;
  previous_reading: number;
  current_reading: number;
  units_consumed?: number;
}

export interface ArrearDetail {
  month: string;
  amount: number;
}

export interface Bill {
  id: number;
  customer_id: number;
  reading_id: number;
  bill_month: string;
  units: number;
  total_amount: number;
  arrears?: number;
  arrears_breakdown?: ArrearDetail[];
  status: 'PAID' | 'UNPAID' | 'PARTIAL';
  generated_by?: number;
  generated_at?: string;
  customer?: Customer;
}
