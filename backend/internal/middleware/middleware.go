package middleware

import (
	"context"
	"net/http"
	"strings"

	"portfolio/backend/internal/service"
)

type contextKey string

const UserContextKey contextKey = "user"

func JWTMiddleware(authService *service.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			var tokenStr string

			// Check Cookie first (for HTMX CMS)
			cookie, err := r.Cookie("admin_token")
			if err == nil && cookie.Value != "" {
				tokenStr = cookie.Value
			} else {
				// Check Authorization Header (for API)
				authHeader := r.Header.Get("Authorization")
				if strings.HasPrefix(authHeader, "Bearer ") {
					tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
				}
			}

			if tokenStr == "" {
				http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
				return
			}

			claims, err := authService.ValidateToken(tokenStr)
			if err != nil {
				http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
