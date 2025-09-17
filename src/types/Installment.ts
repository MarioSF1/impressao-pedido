export interface Installment {
    id: number;
    total_installments: number | null;
    number: number | null;
    due_date: string | null;
    amount: number | null;
}