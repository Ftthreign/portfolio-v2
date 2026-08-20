package main

import (
	"context"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"portfolio/backend/internal/config"
	"portfolio/backend/internal/domain"
	"portfolio/backend/internal/middleware"
	"portfolio/backend/internal/repository/postgres"
	"portfolio/backend/internal/service"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/google/uuid"
)

func main() {
	cfg := config.Load()

	log.Printf("Starting Portfolio Backend Server in [%s] mode on port :%s", cfg.Environment, cfg.Port)

	// Database Connection
	db, err := postgres.NewDB(cfg.DatabaseURL)
	if err != nil {
		log.Printf("Warning: Database connection failed: %v", err)
	}
	defer db.Close()

	// Execute Auto Migrations (00001_init.sql)
	if db != nil && db.Pool != nil {
		runMigrations(db)
	}

	// Services
	authService := service.NewAuthService(cfg.JWTSecret)
	r2Service, err := service.NewR2StorageService(cfg.R2)
	if err != nil {
		log.Printf("Warning: R2 Storage Service initialization error: %v", err)
	} else {
		_ = r2Service
		log.Println("R2 Storage Service ready")
	}

	// Auto-seed admin user & initial portfolio content if empty
	ctxSeed, cancelSeed := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelSeed()
	if db != nil && db.Pool != nil {
		adminEmail := "admin@example.com"
		adminUser, _ := db.GetUserByEmail(ctxSeed, adminEmail)
		if adminUser == nil {
			hash, _ := authService.HashPassword("admin123")
			_, _ = db.CreateUser(ctxSeed, adminEmail, hash)
			log.Println("Seeded default admin user: admin@example.com / admin123")
		}
		seedInitialData(ctxSeed, db)
	}

	r := chi.NewRouter()

	// Global Middlewares
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Timeout(60 * time.Second))

	// CORS Configuration
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:4321", "http://localhost:3000", "http://localhost:8080", "https://*.my-ftthreign.my.id", "https://*.my.id"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "HX-Request", "HX-Target", "HX-Current-URL"},
		ExposedHeaders:   []string{"Link", "HX-Redirect", "HX-Refresh"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(fmt.Sprintf(`{"status":"ok","environment":"%s","time":"%s"}`, cfg.Environment, time.Now().Format(time.RFC3339))))
	})

	// Public REST API Endpoints (For Astro SSR)
	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/profile", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			profile, err := db.GetProfile(r.Context())
			if err != nil || profile == nil {
				w.Write([]byte(`{"name":"Ftthreign","tagline":"Fullstack Engineer & Systems Builder","bio":"Crafting thoughtful digital experiences with Go, TypeScript, Astro, and PostgreSQL.","location":"Indonesia"}`))
				return
			}
			renderJSON(w, profile)
		})

		r.Get("/projects", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			projects, err := db.GetProjects(r.Context(), true)
			if err != nil || len(projects) == 0 {
				w.Write([]byte(`[]`))
				return
			}
			renderJSON(w, projects)
		})

		r.Get("/projects/{slug}", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			slug := chi.URLParam(r, "slug")
			project, err := db.GetProjectBySlug(r.Context(), slug)
			if err != nil || project == nil {
				http.Error(w, `{"error":"project not found"}`, http.StatusNotFound)
				return
			}
			renderJSON(w, project)
		})

		r.Get("/blog", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			posts, err := db.GetBlogPosts(r.Context(), true)
			if err != nil || len(posts) == 0 {
				w.Write([]byte(`[]`))
				return
			}
			renderJSON(w, posts)
		})

		r.Get("/blog/{slug}", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			slug := chi.URLParam(r, "slug")
			post, err := db.GetBlogPostBySlug(r.Context(), slug)
			if err != nil || post == nil {
				http.Error(w, `{"error":"blog post not found"}`, http.StatusNotFound)
				return
			}
			renderJSON(w, post)
		})

		r.Post("/contact", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			var msg domain.ContactMessage
			if err := parseJSON(r, &msg); err != nil {
				http.Error(w, `{"error":"invalid input"}`, http.StatusBadRequest)
				return
			}
			_ = db.SaveContactMessage(r.Context(), &msg)
			w.WriteHeader(http.StatusCreated)
			w.Write([]byte(`{"success":true,"message":"Pesan Anda berhasil diterima"}`))
		})
	})

	// CMS Router Group
	r.Route("/cms", func(r chi.Router) {
		// Login GET & POST
		r.Get("/login", func(w http.ResponseWriter, r *http.Request) {
			tmpl, err := parseTemplateFiles("cms/templates/pages/login.html")
			if err != nil {
				http.Error(w, "Template error: "+err.Error(), http.StatusInternalServerError)
				return
			}
			tmpl.Execute(w, nil)
		})

		r.Post("/login", func(w http.ResponseWriter, r *http.Request) {
			r.ParseForm()
			email := r.FormValue("email")
			password := r.FormValue("password")

			user, err := db.GetUserByEmail(r.Context(), email)
			if err != nil || user == nil || !authService.CheckPasswordHash(password, user.PasswordHash) {
				tmpl, _ := parseTemplateFiles("cms/templates/pages/login.html")
				tmpl.Execute(w, map[string]interface{}{"Error": "Email atau password salah."})
				return
			}

			token, _ := authService.GenerateToken(user.ID, user.Email)
			http.SetCookie(w, &http.Cookie{
				Name:     "admin_token",
				Value:    token,
				Path:     "/",
				HttpOnly: true,
				MaxAge:   86400 * 3,
			})
			http.Redirect(w, r, "/cms/dashboard", http.StatusSeeOther)
		})

		r.Get("/logout", func(w http.ResponseWriter, r *http.Request) {
			http.SetCookie(w, &http.Cookie{
				Name:   "admin_token",
				Value:  "",
				Path:   "/",
				MaxAge: -1,
			})
			http.Redirect(w, r, "/cms/login", http.StatusSeeOther)
		})

		// Protected CMS Pages
		r.Group(func(r chi.Router) {
			r.Use(middleware.JWTMiddleware(authService))

			r.Get("/", func(w http.ResponseWriter, r *http.Request) {
				http.Redirect(w, r, "/cms/dashboard", http.StatusSeeOther)
			})

			r.Get("/dashboard", func(w http.ResponseWriter, r *http.Request) {
				projects, _ := db.GetProjects(r.Context(), false)
				posts, _ := db.GetBlogPosts(r.Context(), false)
				messages, _ := db.GetContactMessages(r.Context())

				renderCMSTemplate(w, "dashboard.html", "dashboard", map[string]interface{}{
					"ProjectCount": len(projects),
					"BlogCount":    len(posts),
					"MessageCount": len(messages),
				})
			})

			r.Get("/projects", func(w http.ResponseWriter, r *http.Request) {
				projects, _ := db.GetProjects(r.Context(), false)
				renderCMSTemplate(w, "projects.html", "projects", map[string]interface{}{
					"Projects": projects,
				})
			})

			r.Post("/projects/save", func(w http.ResponseWriter, r *http.Request) {
				r.ParseForm()
				title := r.FormValue("title")
				slug := slugify(title)
				shortDesc := r.FormValue("short_description")
				fullDesc := r.FormValue("full_description")
				coverURL := r.FormValue("cover_image_url")
				techStr := r.FormValue("tech_stack")
				techStack := splitComma(techStr)
				repoURL := r.FormValue("repo_url")
				liveURL := r.FormValue("live_url")
				published := r.FormValue("published") == "true"

				project := &domain.Project{
					Title:            title,
					Slug:             slug,
					ShortDescription: shortDesc,
					FullDescription:  fullDesc,
					CoverImageURL:    coverURL,
					TechStack:        techStack,
					RepoURL:          repoURL,
					LiveURL:          liveURL,
					Published:        published,
				}
				_ = db.CreateProject(r.Context(), project)
				http.Redirect(w, r, "/cms/projects", http.StatusSeeOther)
			})

			r.Post("/projects/delete", func(w http.ResponseWriter, r *http.Request) {
				r.ParseForm()
				idStr := r.FormValue("id")
				id, err := uuid.Parse(idStr)
				if err == nil {
					_ = db.DeleteProject(r.Context(), id)
				}
				http.Redirect(w, r, "/cms/projects", http.StatusSeeOther)
			})

			r.Get("/blog", func(w http.ResponseWriter, r *http.Request) {
				posts, _ := db.GetBlogPosts(r.Context(), false)
				renderCMSTemplate(w, "blog.html", "blog", map[string]interface{}{
					"BlogPosts": posts,
				})
			})

			r.Post("/blog/save", func(w http.ResponseWriter, r *http.Request) {
				r.ParseForm()
				title := r.FormValue("title")
				slug := slugify(title)
				excerpt := r.FormValue("excerpt")
				content := r.FormValue("content")
				coverURL := r.FormValue("cover_image_url")
				tagStr := r.FormValue("tags")
				tags := splitComma(tagStr)
				published := r.FormValue("published") == "true"

				post := &domain.BlogPost{
					Title:              title,
					Slug:               slug,
					Excerpt:            excerpt,
					Content:            content,
					CoverImageURL:      coverURL,
					Tags:               tags,
					Published:          published,
					ReadingTimeMinutes: calculateReadingTime(content),
				}
				_ = db.CreateBlogPost(r.Context(), post)
				http.Redirect(w, r, "/cms/blog", http.StatusSeeOther)
			})

			r.Post("/blog/delete", func(w http.ResponseWriter, r *http.Request) {
				r.ParseForm()
				idStr := r.FormValue("id")
				id, err := uuid.Parse(idStr)
				if err == nil {
					_ = db.DeleteBlogPost(r.Context(), id)
				}
				http.Redirect(w, r, "/cms/blog", http.StatusSeeOther)
			})

			r.Get("/messages", func(w http.ResponseWriter, r *http.Request) {
				messages, _ := db.GetContactMessages(r.Context())
				renderCMSTemplate(w, "messages.html", "messages", map[string]interface{}{
					"Messages": messages,
				})
			})
		})
	})

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to listen: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	log.Println("Shutting down server gracefully...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced shutdown: %v", err)
	}

	log.Println("Server stopped cleanly.")
}

func renderCMSTemplate(w http.ResponseWriter, pageFile string, activeMenu string, data map[string]interface{}) {
	tmpl, err := parseTemplateFiles("cms/templates/layouts/base.html", "cms/templates/pages/"+pageFile)
	if err != nil {
		http.Error(w, "Template error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	data["Title"] = strings.Title(activeMenu)
	data["Active"] = activeMenu
	tmpl.ExecuteTemplate(w, "base.html", data)
}

func runMigrations(db *postgres.DB) {
	migrationBytes, err := os.ReadFile("migrations/00001_init.sql")
	if err != nil {
		migrationBytes, err = os.ReadFile("backend/migrations/00001_init.sql")
	}
	if err != nil {
		log.Printf("Warning: Failed to read migration file: %v", err)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	_, err = db.Pool.Exec(ctx, string(migrationBytes))
	if err != nil {
		log.Printf("Warning: Failed to execute database migrations: %v", err)
		return
	}
	log.Println("Database migrations executed successfully!")
}

func seedInitialData(ctx context.Context, db *postgres.DB) {
	// Seed Profile if empty
	p, _ := db.GetProfile(ctx)
	if p != nil && p.Name == "Ftthreign" {
		_ = db.UpsertProfile(ctx, &domain.Profile{
			Name:     "Ftthreign",
			Tagline:  "Fullstack Engineer & Systems Builder",
			Bio:      "Building high-performance web applications and backend systems with Go, TypeScript, Astro, and PostgreSQL.",
			Email:    "theownerkill432@gmail.com",
			Location: "Indonesia",
		})
	}

	// Seed Sample Project if empty
	projects, _ := db.GetProjects(ctx, false)
	if len(projects) == 0 {
		_ = db.CreateProject(ctx, &domain.Project{
			Title:            "Portfolio V2 System",
			Slug:             "portfolio-v2-system",
			ShortDescription: "Fullstack portfolio website with Go backend, PostgreSQL, Astro TS SSR, and custom HTMX CMS.",
			FullDescription:  "<p>Detailed overview of the portfolio architecture, including clean layered architecture, Cloudflare R2 storage, and automated GitHub Actions CI/CD deployment.</p>",
			TechStack:        []string{"Go", "PostgreSQL", "Astro TS", "Bun", "TailwindCSS", "GSAP"},
			RepoURL:          "https://github.com/Ftthreign/portfolio-v2",
			LiveURL:          "https://my-ftthreign.my.id",
			Published:        true,
		})
		log.Println("Seeded sample project: Portfolio V2 System")
	}
}

func parseTemplateFiles(filenames ...string) (*template.Template, error) {
	// Try original filenames first
	if tmpl, err := template.ParseFiles(filenames...); err == nil {
		return tmpl, nil
	}

	// Try prefixing with backend/
	var backendFilenames []string
	for _, f := range filenames {
		backendFilenames = append(backendFilenames, "backend/"+f)
	}
	if tmpl, err := template.ParseFiles(backendFilenames...); err == nil {
		return tmpl, nil
	}

	// Try relative from working directory or fallback
	return nil, fmt.Errorf("unable to locate templates: %v", filenames)
}

func slugify(text string) string {
	slug := strings.ToLower(text)
	slug = strings.ReplaceAll(slug, " ", "-")
	return slug
}

func splitComma(input string) []string {
	if strings.TrimSpace(input) == "" {
		return []string{}
	}
	parts := strings.Split(input, ",")
	var result []string
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

func calculateReadingTime(content string) int {
	words := len(strings.Fields(content))
	minutes := words / 200
	if minutes < 1 {
		return 1
	}
	return minutes
}

func parseJSON(r *http.Request, v interface{}) error {
	return json.NewDecoder(r.Body).Decode(v)
}

func renderJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}
