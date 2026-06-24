import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Transaction } from './models/transaction';
import { TransactionService } from './services/transaction.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly transactionService = inject(TransactionService);

  readonly title = signal('budgetapp');
  readonly transactions = signal<Transaction[]>([]);

  form = {
    title: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: '',
  };

  ngOnInit(): void {
    this.loadTransactions();
  }

  private loadTransactions(): void {
    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions.set(transactions);
      },
      error: (error) => {
        console.error('Failed to load transactions:', error);
      },
    });
  }

  addTransaction(): void {
    this.transactionService.createTransaction(this.form).subscribe({
      next: () => {
        this.form = {
          title: '',
          amount: 0,
          type: 'expense',
          category: '',
          date: '',
        };

        this.loadTransactions();
      },
      error: (error) => {
        console.error('Failed to create transaction:', error);
      },
    });
  }

  deleteTransaction(id: number): void {
    this.transactionService.deleteTransaction(id).subscribe({
      next: () => {
        this.loadTransactions();
      },
      error: (error) => {
        console.error('Failed to delete transaction:', error);
      },
    });
  }
}
