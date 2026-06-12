package service

import (
	"budgetapp-backend/model"
)

var transactions = []model.Transaction{}
var nextID = 1

func GetAllTransactions() []model.Transaction {
	return transactions
}

func CreateTransaction(transaction model.Transaction) model.Transaction {
	transaction.ID = nextID
	nextID++
	transactions = append(transactions, transaction)

	return transaction
}

func DeleteTransaction(id int) bool {
	for i, transaction := range transactions {
		if transaction.ID == id {
			transactions = append(transactions[:i], transactions[i+1:]...)
			return true
		}
	}

	return false
}

func UpdateTransaction(id int, updatedTransaction model.Transaction) (model.Transaction, bool) {
	for i, transaction := range transactions {
		if transaction.ID == id {
			updatedTransaction.ID = id
			transactions[i] = updatedTransaction
			return updatedTransaction, true
		}
	}
	return model.Transaction{}, false
}

func GetMonthlyIncome(month string) float64 {
	TotalIncome := 0.0
	for _, transaction := range transactions {
		if transaction.Type == "income" && len(transaction.Date) >= 7 && transaction.Date[:7] == month {
			TotalIncome += transaction.Amount
		}
	}
	return TotalIncome
}

func GetMonthlyExpenses(month string) float64 {
	TotalExpense := 0.0
	for _, transaction := range transactions {
		if transaction.Type == "expense" && len(transaction.Date) >= 7 && transaction.Date[:7] == month {
			TotalExpense += transaction.Amount
		}
	}
	return TotalExpense
}

func GetBalance(month string) float64 {
	TotalBalance := 0.0
	TotalBalance = GetMonthlyIncome(month) - GetMonthlyExpenses(month)
	return TotalBalance
}
