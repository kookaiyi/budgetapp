package main

import (
	"budgetapp-backend/controller"

	_ "budgetapp-backend/docs"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	r := gin.Default()

	r.GET("/transactions", controller.GetTransactions)
	r.POST("/transactions", controller.CreateTransaction)
	r.PUT("/transactions/:id", controller.UpdateTransaction)
	r.DELETE("/transactions/:id", controller.DeleteTransaction)

	r.GET("/monthly-income", controller.GetMonthlyIncome)
	r.GET("/monthly-expenses", controller.GetMonthlyExpenses)
	r.GET("/balance", controller.GetBalance)

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	r.Run(":8080")
}
