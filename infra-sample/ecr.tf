resource "aws_ecr_repository" "ecr_repositories" {
  name = var.ecr_repository_name

  image_scanning_configuration {
    scan_on_push = true
  }
}