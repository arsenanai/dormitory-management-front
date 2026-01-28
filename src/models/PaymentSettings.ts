export interface PaymentSettings {
  semester_config: {
    fall: {
      start_month: number;
      start_day: number;
      end_month: number;
      end_day: number;
      payment_deadline_month: number;
      payment_deadline_day: number;
    };
    spring: {
      start_month: number;
      start_day: number;
      end_month: number;
      end_day: number;
      payment_deadline_month: number;
      payment_deadline_day: number;
    };
    summer: {
      start_month: number;
      start_day: number;
      end_month: number;
      end_day: number;
      payment_deadline_month: number;
      payment_deadline_day: number;
    };
  };
}
