package domain

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type Profile struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Tagline   string    `json:"tagline"`
	Bio       string    `json:"bio"`
	AvatarURL string    `json:"avatar_url"`
	ResumeURL string    `json:"resume_url"`
	Email     string    `json:"email"`
	Location  string    `json:"location"`
	UpdatedAt time.Time `json:"updated_at"`
}

type SocialLink struct {
	ID         uuid.UUID `json:"id"`
	Platform   string    `json:"platform"`
	URL        string    `json:"url"`
	Icon       string    `json:"icon"`
	OrderIndex int       `json:"order_index"`
}

type SkillCategory struct {
	ID         uuid.UUID `json:"id"`
	Name       string    `json:"name"`
	OrderIndex int       `json:"order_index"`
	Skills     []Skill   `json:"skills,omitempty"`
}

type Skill struct {
	ID          uuid.UUID `json:"id"`
	CategoryID  *uuid.UUID `json:"category_id,omitempty"`
	Name        string    `json:"name"`
	IconURL     string    `json:"icon_url"`
	Proficiency int       `json:"proficiency"`
	OrderIndex  int       `json:"order_index"`
}

type Project struct {
	ID               uuid.UUID      `json:"id"`
	Title            string         `json:"title"`
	Slug             string         `json:"slug"`
	ShortDescription string         `json:"short_description"`
	FullDescription  string         `json:"full_description"`
	CoverImageURL    string         `json:"cover_image_url"`
	TechStack        []string       `json:"tech_stack"`
	RepoURL          string         `json:"repo_url"`
	LiveURL          string         `json:"live_url"`
	Featured         bool           `json:"featured"`
	Published        bool           `json:"published"`
	OrderIndex       int            `json:"order_index"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	Images           []ProjectImage `json:"images,omitempty"`
}

type ProjectImage struct {
	ID         uuid.UUID `json:"id"`
	ProjectID  uuid.UUID `json:"project_id"`
	ImageURL   string    `json:"image_url"`
	Caption    string    `json:"caption"`
	OrderIndex int       `json:"order_index"`
}

type BlogPost struct {
	ID                 uuid.UUID  `json:"id"`
	Title              string     `json:"title"`
	Slug               string     `json:"slug"`
	Excerpt            string     `json:"excerpt"`
	Content            string     `json:"content"`
	CoverImageURL      string     `json:"cover_image_url"`
	Tags               []string   `json:"tags"`
	Published          bool       `json:"published"`
	PublishedAt        *time.Time `json:"published_at,omitempty"`
	ReadingTimeMinutes int        `json:"reading_time_minutes"`
	SEOTitle           string     `json:"seo_title"`
	SEODescription     string     `json:"seo_description"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

type Experience struct {
	ID          uuid.UUID  `json:"id"`
	Company     string     `json:"company"`
	Role        string     `json:"role"`
	Description string     `json:"description"`
	StartDate   time.Time  `json:"start_date"`
	EndDate     *time.Time `json:"end_date,omitempty"`
	LogoURL     string     `json:"logo_url"`
	CompanyURL  string     `json:"company_url"`
	TechStack   []string   `json:"tech_stack"`
	OrderIndex  int        `json:"order_index"`
}

type Testimonial struct {
	ID         uuid.UUID `json:"id"`
	Name       string    `json:"name"`
	Role       string    `json:"role"`
	Company    string    `json:"company"`
	AvatarURL  string    `json:"avatar_url"`
	Content    string    `json:"content"`
	Rating     int       `json:"rating"`
	Published  bool      `json:"published"`
	OrderIndex int       `json:"order_index"`
	CreatedAt  time.Time `json:"created_at"`
}

type ContactMessage struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Subject   string    `json:"subject"`
	Message   string    `json:"message"`
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"created_at"`
}

type Media struct {
	ID         uuid.UUID `json:"id"`
	Filename   string    `json:"filename"`
	Key        string    `json:"key"`
	URL        string    `json:"url"`
	MimeType   string    `json:"mime_type"`
	SizeBytes  int64     `json:"size_bytes"`
	UploadedAt time.Time `json:"uploaded_at"`
}

type SEOSetting struct {
	ID          uuid.UUID `json:"id"`
	Page        string    `json:"page"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	OGImageURL  string    `json:"og_image_url"`
	UpdatedAt   time.Time `json:"updated_at"`
}
