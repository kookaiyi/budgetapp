import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Transaction, TransactionPayload } from '../models/transaction';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080';

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`);
  }

  createTransaction(payload: TransactionPayload): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, payload);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/transactions/${id}`);
  }

  updateTransaction(id: number, payload: TransactionPayload): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/transactions/${id}`, payload);
  }

  getMonthlyIncome(month: string): Observable<{ total_income: number }> {
    return this.http.get<{ total_income: number }>(`${this.apiUrl}/monthly-income`, {
      params: { month },
    });
  }

  getMonthlyExpense(month: string): Observable<{ total_expenses: number }> {
    return this.http.get<{ total_expenses: number }>(`${this.apiUrl}/monthly-expenses`, {
      params: { month },
    });
  }

  getBalance(month: string): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(`${this.apiUrl}/balance`, {
      params: { month },
    });
  }
}
