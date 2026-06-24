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
  editingId = signal<number | null>(null);


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
  editTransaction(transaction: Transaction): void {
  this.editingId.set(transaction.id);

  this.form = {
    title: transaction.title,
    amount: transaction.amount,
    type: transaction.type,
    category: transaction.category,
    date: transaction.date,
    };
  }

  updateTransaction(): void {
    const id = this.editingId();

    if (id === null) {
      return;
    }

    this.transactionService.updateTransaction(id, this.form).subscribe({
      next: () => {
        this.editingId.set(null);
        this.form = {
          title: '',
          amount: 0,
          type: 'expense',
          category: '',
          date: '',
        };

        this.editingId.set(null);
        this.loadTransactions();
      },
      error: (error) => {
        console.error('Failed to update transaction:', error);
      },
    });
  }
}
