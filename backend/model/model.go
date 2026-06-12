package model

type Transaction struct {
	ID       int     `json:"id"`
	Title    string  `json:"title"`
	Amount   float64 `json:"amount"`
	Type     string  `json:"type"` // income or expense
	Category string  `json:"category"`
	Date     string  `json:"date"`
}

type MonthlySummary struct {
	Month        string  `json:"month"`
	TotalIncome  float64 `json:"total_income"`
	TotalExpense float64 `json:"total_expense"`
	Balance      float64 `json:"balance"`
}
