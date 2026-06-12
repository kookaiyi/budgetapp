package controller

import (
	"net/http"
	"strconv"

	"budgetapp-backend/model"
	TransactionService "budgetapp-backend/service"

	"github.com/gin-gonic/gin"
)

func GetTransactions(c *gin.Context) {
	transactions := TransactionService.GetAllTransactions()
	c.JSON(http.StatusOK, transactions)
}

func CreateTransaction(c *gin.Context) {
	var transaction model.Transaction

	if err := c.ShouldBindJSON(&transaction); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	createdTransaction := TransactionService.CreateTransaction(transaction)
	c.JSON(http.StatusCreated, createdTransaction)
}

func DeleteTransaction(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	success := TransactionService.DeleteTransaction(id)

	if !success {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Transaction deleted"})
}

func UpdateTransaction(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id"})
		return
	}

	var transaction model.Transaction

	if err := c.ShouldBindJSON(&transaction); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedTransaction, success := TransactionService.UpdateTransaction(id, transaction)

	if !success {
		c.JSON(http.StatusNotFound, gin.H{"error": "TransactionNotFound"})
		return
	}

	c.JSON(http.StatusOK, updatedTransaction)

}

func GetMonthlyIncome(c *gin.Context) {
	month := c.Query("month")
	if month == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Month query parameter is required"})
		return
	}

	totalIncome := TransactionService.GetMonthlyIncome(month)
	c.JSON(http.StatusOK, gin.H{"total_income": totalIncome})
}

func GetMonthlyExpenses(c *gin.Context) {
	month := c.Query("month")
	if month == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Month query parameter is required"})
		return
	}

	totalExpenses := TransactionService.GetMonthlyExpenses(month)
	c.JSON(http.StatusOK, gin.H{"total_expenses": totalExpenses})
}

func GetBalance(c *gin.Context) {
	month := c.Query("month")
	if month == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Month query parameter is required"})
		return
	}

	balance := TransactionService.GetBalance(month)
	c.JSON(http.StatusOK, gin.H{"balance": balance})
}
