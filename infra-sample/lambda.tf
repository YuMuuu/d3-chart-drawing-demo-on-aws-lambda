resource "aws_iam_role" "this" {
  name                  = "chart-drawing-lambda-role"
  assume_role_policy    = data.aws_iam_policy_document.assume.json
  force_detach_policies = true
}

resource "aws_iam_policy" "this" {
  name        = "chart-drawing-lambda-policy"
  description = "policy for lambda functions that draw png from json"

  policy = data.aws_iam_policy_document.this.json
}

data "aws_iam_policy_document" "assume" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# see: https://docs.aws.amazon.com/lambda/latest/operatorguide/access-logs.html
data "aws_iam_policy_document" "this" {

  statement {
    actions = [
      "logs:CreateLogGroup"
    ]
    effect = "Allow"
    resources = [
      "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.self.account_id}:log-group:"
    ]
  }
  statement {
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    effect = "Allow"
    resources = [
      "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.self.account_id}:log-group:/aws/lambda/functionname:*",
    ]
  }
  statement {
    actions = [
      "s3:ListBucket",
      "s3:GetObject*",
      "s3:PutObject*",
    ]
    effect = "Allow"
    resources = [
      "arn:aws:s3:::${var.bucket}",
      "arn:aws:s3:::${var.bucket}/*",
    ]
  }
}


resource "aws_iam_role_policy_attachment" "this" {
  role       = aws_iam_role.this.name
  policy_arn = aws_iam_policy.this.arn
}

resource "aws_lambda_function" "this" {
  description   = "Generate png graph from s3 json."
  package_type  = "Image"
  image_uri     = var.image_uri
  function_name = "d3-chart-drawing-demo-on-lambda"
  role          = aws_iam_role.this.arn
  memory_size   = 10240
  timeout       = 300
  environment {
    variables = local.lambda_environment_variables
  }
}
# トリガーの設定。S3にobjectが置かれたらkickする
resource "aws_lambda_permission" "this" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.arn
  principal     = "s3.amazonaws.com"
  source_arn    = "arn:aws:s3:::${var.bucket}"
}

resource "aws_s3_bucket_notification" "this" {
  bucket = var.bucket
  lambda_function {
    lambda_function_arn = aws_lambda_function.this.arn
    events              = ["s3:ObjectCreated:*"]
    filter_suffix       = ".json"
  }
}
