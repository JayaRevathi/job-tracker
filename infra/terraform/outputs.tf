output "ec2_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.job_tracker_ec2.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.job_tracker_ec2.public_dns
}

output "frontend_bucket_name" {
  description = "Frontend S3 bucket name"
  value       = aws_s3_bucket.frontend_bucket.bucket
}

output "frontend_website_url" {
  description = "Frontend S3 website endpoint"
  value       = aws_s3_bucket_website_configuration.frontend_website.website_endpoint
}

output "uploads_bucket_name" {
  description = "Uploads S3 bucket name"
  value       = aws_s3_bucket.uploads_bucket.bucket
}