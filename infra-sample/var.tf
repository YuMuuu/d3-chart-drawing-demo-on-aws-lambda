data "aws_caller_identity" "self" {}
data "aws_region" "current" {}

variable "image_url" {
  type        = string
  description = "ECR image URI that your container image has uploaded."
}

variable "bucket" {
  type        = string
  description = "S3 bucket name for input .json and output .png file"
}

variable "ecr_repository_name" {
  type        = string
  description = "ECR repository name for uploading your container images."
}
locals {
  lambda_environment_variables = {
    ENV = "production"
  }
}
