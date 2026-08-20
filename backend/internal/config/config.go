package config

import (
	"os"
)

type Config struct {
	Environment string
	Port        string
	DatabaseURL string
	JWTSecret   string
	R2          R2Config
}

type R2Config struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	BucketName      string
	PublicURL       string
}

func Load() *Config {
	return &Config{
		Environment: getEnv("ENVIRONMENT", "development"),
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://portfolio_user:portfolio_secret@localhost:5432/portfolio_db?sslmode=disable"),
		JWTSecret:   getEnv("JWT_SECRET", "super-secret-jwt-key-change-in-production-123456789"),
		R2: R2Config{
			AccountID:       os.Getenv("R2_ACCOUNT_ID"),
			AccessKeyID:     os.Getenv("R2_ACCESS_KEY_ID"),
			SecretAccessKey: os.Getenv("R2_SECRET_ACCESS_KEY"),
			BucketName:      os.Getenv("R2_BUCKET_NAME"),
			PublicURL:       os.Getenv("R2_PUBLIC_URL"),
		},
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
