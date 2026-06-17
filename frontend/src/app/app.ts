import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Transaction, TransactionPayload, TransactionType } from './models/transaction';
import { TransactionService } from './services/transaction.service';

interface TransactionForm {
  title: string;
  amount: number | null;
  type: TransactionType;
  category: string;
  date: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly transactionService = inject(TransactionService);
  private readonly currencyFormatter = new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  });
  private readonly dateFormatter = new Intl.DateTimeFormat('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  protected readonly categoryOptions = [
    'Salary',
    'Freelance',
    'Food',
    'Transport',
    'Bills',
    'Shopping',
    'Entertainment',
    'Savings',
    'Other',
  ];

  protected readonly transactions = signal<Transaction[]>([]);
  protected readonly selectedMonth = signal(this.getCurrentMonth());
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly errorMessage = signal('');

  protected formModel: TransactionForm = this.createEmptyForm();

  protected readonly monthlyTransactions = computed(() => {
    const month = this.selectedMonth();
    return this.transactions().filter((transaction) => transaction.date.startsWith(month));
  });

  protected readonly incomeTotal = computed(() =>
    this.monthlyTransactions()
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0),
  );

  protected readonly expenseTotal = computed(() =>
    this.monthlyTransactions()
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0),
  );

  protected readonly balanceTotal = computed(() => this.incomeTotal() - this.expenseTotal());

  protected readonly incomeCount = computed(
    () => this.monthlyTransactions().filter((transaction) => transaction.type === 'income').length,
  );

  protected readonly expenseCount = computed(
    () => this.monthlyTransactions().filter((transaction) => transaction.type === 'expense').length,
  );

  protected readonly selectedMonthLabel = computed(() => {
    const [year, month] = this.selectedMonth().split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return new Intl.DateTimeFormat('en-MY', { month: 'long', year: 'numeric' }).format(date);
  });

  protected readonly savingsRate = computed(() => {
    const income = this.incomeTotal();
    if (income <= 0) {
      return 0;
    }

    return Math.round((this.balanceTotal() / income) * 100);
  });

  protected readonly topExpenseCategory = computed(() => {
    const categoryTotals = new Map<string, number>();

    for (const transaction of this.monthlyTransactions()) {
      if (transaction.type === 'expense') {
        categoryTotals.set(
          transaction.category,
          (categoryTotals.get(transaction.category) ?? 0) + transaction.amount,
        );
      }
    }

    const rankedCategories = [...categoryTotals.entries()].sort(
      (firstCategory, secondCategory) => secondCategory[1] - firstCategory[1],
    );

    return rankedCategories[0]?.[0] ?? 'No expenses yet';
  });

  protected readonly averageExpense = computed(() => {
    const expenseTransactions = this.monthlyTransactions().filter(
      (transaction) => transaction.type === 'expense',
    );

    if (!expenseTransactions.length) {
      return 0;
    }

    return this.expenseTotal() / expenseTransactions.length;
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadTransactions();
    }
  }

  protected loadTransactions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.transactionService
      .getTransactions()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (transactions) => this.transactions.set(this.sortTransactions(transactions)),
        error: () =>
          this.errorMessage.set(
            'Start the Go backend on port 8080, then refresh this page to load transactions.',
          ),
      });
  }

  protected saveTransaction(): void {
    const payload = this.createPayload();

    if (!payload) {
      return;
    }

    const editingId = this.editingId();
    this.isSaving.set(true);
    this.errorMessage.set('');

    const request = editingId
      ? this.transactionService.updateTransaction(editingId, payload)
      : this.transactionService.createTransaction(payload);

    request.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (savedTransaction) => {
        this.transactions.update((transactions) => {
          const nextTransactions = editingId
            ? transactions.map((transaction) =>
                transaction.id === editingId ? savedTransaction : transaction,
              )
            : [savedTransaction, ...transactions];

          return this.sortTransactions(nextTransactions);
        });
        this.resetForm();
      },
      error: () => this.errorMessage.set('Could not save this transaction. Please try again.'),
    });
  }

  protected editTransaction(transaction: Transaction): void {
    this.editingId.set(transaction.id);
    this.formModel = {
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
    };

    if (isPlatformBrowser(this.platformId)) {
      document.getElementById('transaction-form')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  protected deleteTransaction(transactionId: number): void {
    const shouldDelete =
      !isPlatformBrowser(this.platformId) ||
      window.confirm('Delete this transaction from your budget?');

    if (!shouldDelete) {
      return;
    }

    this.errorMessage.set('');
    this.transactionService.deleteTransaction(transactionId).subscribe({
      next: () =>
        this.transactions.update((transactions) =>
          transactions.filter((transaction) => transaction.id !== transactionId),
        ),
      error: () => this.errorMessage.set('Could not delete this transaction. Please try again.'),
    });
  }

  protected setType(type: TransactionType): void {
    this.formModel.type = type;
  }

  protected cancelEdit(): void {
    this.resetForm();
  }

  protected formatCurrency(amount: number): string {
    return this.currencyFormatter.format(amount);
  }

  protected formatDate(value: string): string {
    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return this.dateFormatter.format(date);
  }

  protected transactionCountLabel(): string {
    const count = this.monthlyTransactions().length;
    return `${count} ${count === 1 ? 'transaction' : 'transactions'}`;
  }

  private createPayload(): TransactionPayload | null {
    const amount = Number(this.formModel.amount);
    const title = this.formModel.title.trim();
    const category = this.formModel.category.trim();

    if (!title || !category || !this.formModel.date || !Number.isFinite(amount) || amount <= 0) {
      this.errorMessage.set('Please complete the form with a title, category, date, and amount.');
      return null;
    }

    return {
      title,
      amount,
      type: this.formModel.type,
      category,
      date: this.formModel.date,
    };
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.formModel = this.createEmptyForm();
  }

  private createEmptyForm(): TransactionForm {
    return {
      title: '',
      amount: null,
      type: 'expense',
      category: 'Food',
      date: this.getCurrentDate(),
    };
  }

  private getCurrentMonth(): string {
    return this.getCurrentDate().slice(0, 7);
  }

  private getCurrentDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private sortTransactions(transactions: Transaction[]): Transaction[] {
    return [...transactions].sort((firstTransaction, secondTransaction) => {
      const dateCompare = secondTransaction.date.localeCompare(firstTransaction.date);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return secondTransaction.id - firstTransaction.id;
    });
  }
}
