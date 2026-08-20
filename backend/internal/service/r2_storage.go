package service

import (
	"context"
	"fmt"
	"io"
	"path/filepath"
	"time"

	"portfolio/backend/internal/config"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

type R2StorageService struct {
	client     *s3.Client
	bucketName string
	publicURL  string
}

func NewR2StorageService(cfg config.R2Config) (*R2StorageService, error) {
	if cfg.AccountID == "" || cfg.AccessKeyID == "" || cfg.SecretAccessKey == "" {
		return &R2StorageService{
			bucketName: cfg.BucketName,
			publicURL:  cfg.PublicURL,
		}, nil
	}

	r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.AccountID),
		}, nil
	})

	awsCfg, err := awsconfig.LoadDefaultConfig(context.TODO(),
		awsconfig.WithEndpointResolverWithOptions(r2Resolver),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, "")),
		awsconfig.WithRegion("auto"),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load R2 AWS config: %w", err)
	}

	client := s3.NewFromConfig(awsCfg)

	return &R2StorageService{
		client:     client,
		bucketName: cfg.BucketName,
		publicURL:  cfg.PublicURL,
	}, nil
}

func (s *R2StorageService) UploadFile(ctx context.Context, fileReader io.Reader, originalFilename string, mimeType string) (key string, fileURL string, err error) {
	ext := filepath.Ext(originalFilename)
	uniqueKey := fmt.Sprintf("%s/%s%s", time.Now().Format("2006/01"), uuid.New().String(), ext)

	if s.client == nil {
		// Mock upload URL for dev mode if R2 creds are not yet set
		return uniqueKey, fmt.Sprintf("/uploads/%s", originalFilename), nil
	}

	_, err = s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucketName),
		Key:         aws.String(uniqueKey),
		Body:        fileReader,
		ContentType: aws.String(mimeType),
	})
	if err != nil {
		return "", "", fmt.Errorf("failed to upload object to Cloudflare R2: %w", err)
	}

	fullURL := fmt.Sprintf("%s/%s", s.publicURL, uniqueKey)
	return uniqueKey, fullURL, nil
}

func (s *R2StorageService) DeleteFile(ctx context.Context, key string) error {
	if s.client == nil {
		return nil
	}

	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("failed to delete object from Cloudflare R2: %w", err)
	}
	return nil
}
