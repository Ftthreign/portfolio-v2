package postgres

import (
	"context"

	"portfolio/backend/internal/domain"

	"github.com/google/uuid"
)

// User Methods
func (db *DB) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	if db.Pool == nil {
		return nil, nil
	}
	user := &domain.User{}
	query := `SELECT id, email, password_hash, created_at FROM users WHERE email = $1`
	err := db.Pool.QueryRow(ctx, query, email).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (db *DB) CreateUser(ctx context.Context, email, passwordHash string) (*domain.User, error) {
	if db.Pool == nil {
		return &domain.User{ID: uuid.New(), Email: email}, nil
	}
	user := &domain.User{}
	query := `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, password_hash, created_at`
	err := db.Pool.QueryRow(ctx, query, email, passwordHash).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

// Profile & Social Links
func (db *DB) GetProfile(ctx context.Context) (*domain.Profile, error) {
	if db.Pool == nil {
		return &domain.Profile{Name: "Ftthreign", Tagline: "Fullstack Engineer", Bio: "Crafting clean systems."}, nil
	}
	p := &domain.Profile{}
	query := `SELECT id, name, tagline, bio, COALESCE(avatar_url, ''), COALESCE(resume_url, ''), COALESCE(email, ''), COALESCE(location, ''), updated_at FROM profile LIMIT 1`
	err := db.Pool.QueryRow(ctx, query).Scan(&p.ID, &p.Name, &p.Tagline, &p.Bio, &p.AvatarURL, &p.ResumeURL, &p.Email, &p.Location, &p.UpdatedAt)
	if err != nil {
		return &domain.Profile{Name: "Ftthreign", Tagline: "Fullstack Engineer", Bio: "Crafting clean systems."}, nil
	}
	return p, nil
}

func (db *DB) UpsertProfile(ctx context.Context, p *domain.Profile) error {
	if db.Pool == nil {
		return nil
	}
	query := `
		INSERT INTO profile (id, name, tagline, bio, avatar_url, resume_url, email, location, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			tagline = EXCLUDED.tagline,
			bio = EXCLUDED.bio,
			avatar_url = EXCLUDED.avatar_url,
			resume_url = EXCLUDED.resume_url,
			email = EXCLUDED.email,
			location = EXCLUDED.location,
			updated_at = NOW()
	`
	_, err := db.Pool.Exec(ctx, query, p.Name, p.Tagline, p.Bio, p.AvatarURL, p.ResumeURL, p.Email, p.Location)
	return err
}

// Projects
func (db *DB) GetProjects(ctx context.Context, publishedOnly bool) ([]domain.Project, error) {
	if db.Pool == nil {
		return []domain.Project{}, nil
	}
	query := `SELECT id, title, slug, COALESCE(short_description, ''), COALESCE(full_description, ''), COALESCE(cover_image_url, ''), tech_stack, COALESCE(repo_url, ''), COALESCE(live_url, ''), featured, published, order_index, created_at, updated_at FROM projects`
	if publishedOnly {
		query += ` WHERE published = true`
	}
	query += ` ORDER BY order_index ASC, created_at DESC`

	rows, err := db.Pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []domain.Project
	for rows.Next() {
		var p domain.Project
		err := rows.Scan(&p.ID, &p.Title, &p.Slug, &p.ShortDescription, &p.FullDescription, &p.CoverImageURL, &p.TechStack, &p.RepoURL, &p.LiveURL, &p.Featured, &p.Published, &p.OrderIndex, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, err
		}
		projects = append(projects, p)
	}
	return projects, nil
}

func (db *DB) GetProjectBySlug(ctx context.Context, slug string) (*domain.Project, error) {
	if db.Pool == nil {
		return nil, nil
	}
	p := &domain.Project{}
	query := `SELECT id, title, slug, COALESCE(short_description, ''), COALESCE(full_description, ''), COALESCE(cover_image_url, ''), tech_stack, COALESCE(repo_url, ''), COALESCE(live_url, ''), featured, published, order_index, created_at, updated_at FROM projects WHERE slug = $1`
	err := db.Pool.QueryRow(ctx, query, slug).Scan(&p.ID, &p.Title, &p.Slug, &p.ShortDescription, &p.FullDescription, &p.CoverImageURL, &p.TechStack, &p.RepoURL, &p.LiveURL, &p.Featured, &p.Published, &p.OrderIndex, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func (db *DB) CreateProject(ctx context.Context, p *domain.Project) error {
	if db.Pool == nil {
		return nil
	}
	query := `INSERT INTO projects (title, slug, short_description, full_description, cover_image_url, tech_stack, repo_url, live_url, featured, published, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
	_, err := db.Pool.Exec(ctx, query, p.Title, p.Slug, p.ShortDescription, p.FullDescription, p.CoverImageURL, p.TechStack, p.RepoURL, p.LiveURL, p.Featured, p.Published, p.OrderIndex)
	return err
}

func (db *DB) DeleteProject(ctx context.Context, id uuid.UUID) error {
	if db.Pool == nil {
		return nil
	}
	_, err := db.Pool.Exec(ctx, `DELETE FROM projects WHERE id = $1`, id)
	return err
}

// Blog Posts
func (db *DB) GetBlogPosts(ctx context.Context, publishedOnly bool) ([]domain.BlogPost, error) {
	if db.Pool == nil {
		return []domain.BlogPost{}, nil
	}
	query := `SELECT id, title, slug, COALESCE(excerpt, ''), content, COALESCE(cover_image_url, ''), tags, published, published_at, reading_time_minutes, COALESCE(seo_title, ''), COALESCE(seo_description, ''), created_at, updated_at FROM blog_posts`
	if publishedOnly {
		query += ` WHERE published = true`
	}
	query += ` ORDER BY created_at DESC`

	rows, err := db.Pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []domain.BlogPost
	for rows.Next() {
		var b domain.BlogPost
		err := rows.Scan(&b.ID, &b.Title, &b.Slug, &b.Excerpt, &b.Content, &b.CoverImageURL, &b.Tags, &b.Published, &b.PublishedAt, &b.ReadingTimeMinutes, &b.SEOTitle, &b.SEODescription, &b.CreatedAt, &b.UpdatedAt)
		if err != nil {
			return nil, err
		}
		posts = append(posts, b)
	}
	return posts, nil
}

func (db *DB) GetBlogPostBySlug(ctx context.Context, slug string) (*domain.BlogPost, error) {
	if db.Pool == nil {
		return nil, nil
	}
	b := &domain.BlogPost{}
	query := `SELECT id, title, slug, COALESCE(excerpt, ''), content, COALESCE(cover_image_url, ''), tags, published, published_at, reading_time_minutes, COALESCE(seo_title, ''), COALESCE(seo_description, ''), created_at, updated_at FROM blog_posts WHERE slug = $1`
	err := db.Pool.QueryRow(ctx, query, slug).Scan(&b.ID, &b.Title, &b.Slug, &b.Excerpt, &b.Content, &b.CoverImageURL, &b.Tags, &b.Published, &b.PublishedAt, &b.ReadingTimeMinutes, &b.SEOTitle, &b.SEODescription, &b.CreatedAt, &b.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return b, nil
}

func (db *DB) CreateBlogPost(ctx context.Context, b *domain.BlogPost) error {
	if db.Pool == nil {
		return nil
	}
	query := `INSERT INTO blog_posts (title, slug, excerpt, content, cover_image_url, tags, published, reading_time_minutes, seo_title, seo_description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
	_, err := db.Pool.Exec(ctx, query, b.Title, b.Slug, b.Excerpt, b.Content, b.CoverImageURL, b.Tags, b.Published, b.ReadingTimeMinutes, b.SEOTitle, b.SEODescription)
	return err
}

func (db *DB) DeleteBlogPost(ctx context.Context, id uuid.UUID) error {
	if db.Pool == nil {
		return nil
	}
	_, err := db.Pool.Exec(ctx, `DELETE FROM blog_posts WHERE id = $1`, id)
	return err
}

// Contact Messages
func (db *DB) SaveContactMessage(ctx context.Context, msg *domain.ContactMessage) error {
	if db.Pool == nil {
		return nil
	}
	query := `INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)`
	_, err := db.Pool.Exec(ctx, query, msg.Name, msg.Email, msg.Subject, msg.Message)
	return err
}

func (db *DB) GetContactMessages(ctx context.Context) ([]domain.ContactMessage, error) {
	if db.Pool == nil {
		return []domain.ContactMessage{}, nil
	}
	query := `SELECT id, name, email, COALESCE(subject, ''), message, read, created_at FROM contact_messages ORDER BY created_at DESC`
	rows, err := db.Pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.ContactMessage
	for rows.Next() {
		var m domain.ContactMessage
		err := rows.Scan(&m.ID, &m.Name, &m.Email, &m.Subject, &m.Message, &m.Read, &m.CreatedAt)
		if err != nil {
			return nil, err
		}
		list = append(list, m)
	}
	return list, nil
}
