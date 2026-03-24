aws_region           = "us-east-1"
project_name         = "job-tracker"
instance_type        = "t3.small"

ami_id               = "ami-02dfbd4ff395f2a1b"
key_pair_name        = "job-tracker-key"

frontend_bucket_name = "revathi-job-tracker-frontend-20260323"
uploads_bucket_name  = "revathi-job-tracker-uploads-20260323"

allowed_ssh_cidr     = ["0.0.0.0/0"]
root_volume_size     = 20