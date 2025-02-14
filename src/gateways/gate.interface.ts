export enum GateType {
  MBBANK = 'MBBANK',
  ACBBANK = 'ACBBANK',
  TPBANK = 'TPBANK',
  VCBBANK = 'VCBBANK',
  TRON_USDT_BLOCKCHAIN = 'TRON_USDT_BLOCKCHAIN',
  BEP20_USDT_BLOCKCHAIN = 'BEP20_USDT_BLOCKCHAIN',
}
export interface Payment {
  transaction_id: string;
  content: string;
  credit_amount: number;  // Income
  debit_amount: number; // Expense
  date: Date;
  gate: GateType;
  account_receiver: string;
  account_sender: string;
  name_sender: string;
}

export interface GateConfig {
  name: string;
  type: GateType;
  password?: string;
  login_id?: string;
  account: string;
  token: string;
  repeat_interval_in_sec: number;
  proxy?: string;
  device_id?: string;
  get_transaction_day_limit: number;
  get_transaction_count_limit: number;
}
