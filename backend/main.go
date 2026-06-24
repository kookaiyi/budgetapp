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

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

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
