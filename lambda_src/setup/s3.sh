#!/bin/bash
set -e

LOCALSTACK_HOST="0.0.0.0"
LOCALSTACK_PORT="4566"
export AWS_ACCESS_KEY_ID=dummy 
export AWS_SECRET_ACCESS_KEY=dummy 

aws --region=ap-northeast-1 --endpoint-url="https://$LOCALSTACK_HOST:$LOCALSTACK_PORT" --no-verify-ssl s3 mb "s3://local-bucket" || true