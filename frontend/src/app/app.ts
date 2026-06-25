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
  onMonthChange(month: string): void {
  this.selectedMonth.set(month);
  this.loadSummary();
}

  private readonly transactionService = inject(TransactionService);

  readonly title = signal('budgetapp');
  readonly transactions = signal<Transaction[]>([]);
  editingId = signal<number | null>(null);

  selectedMonth = signal('2026-06');
  monthlyIncome = signal(0);
  monthlyExpense = signal(0);
  balance = signal(0);



  form = {
    title: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: '',
  };

  ngOnInit(): void {
    this.loadTransactions();
    this.loadSummary();
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
        this.loadSummary();
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
        this.loadSummary();
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

  private loadSummary(): void {
    const month = this.selectedMonth();

    this.transactionService.getMonthlyIncome(month).subscribe({
      next: (income) => {
        this.monthlyIncome.set(income.total_income);
      },
      error: (error) => {
        console.error('Failed to load monthly income:', error);
      },
    });

    this.transactionService.getMonthlyExpense(month).subscribe({
      next: (expense) => {
        this.monthlyExpense.set(expense.total_expenses);
      },
      error: (error) => {
        console.error('Failed to load monthly expense:', error);
      },
    });

    this.transactionService.getBalance(month).subscribe({
      next: (balance) => {
        this.balance.set(balance.balance);
      },
      error: (error) => {
        console.error('Failed to load balance:', error);
      },
    });
  }
}