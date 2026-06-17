import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Transaction, TransactionPayload } from '../models/transaction';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly transactionsUrl = '/api/transactions';

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.transactionsUrl);
  }

  createTransaction(transaction: TransactionPayload): Observable<Transaction> {
    return this.http.post<Transaction>(this.transactionsUrl, transaction);
  }

  updateTransaction(transactionId: number, transaction: TransactionPayload): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.transactionsUrl}/${transactionId}`, transaction);
  }

  deleteTransaction(transactionId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.transactionsUrl}/${transactionId}`);
  }
}
