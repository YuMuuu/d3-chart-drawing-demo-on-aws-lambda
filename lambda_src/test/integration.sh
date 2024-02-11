
#!/bin/bash
set -e

LOCALSTACK_HOST="0.0.0.0"
LOCALSTACK_PORT="4566"
export AWS_ACCESS_KEY_ID=dummy 
export AWS_SECRET_ACCESS_KEY=dummy 


docker-compose build
docker-compose up -d 
sh ./setup/s3.sh


# lambdaで読み込むfileを予め削除する
echo "delete file"
aws --region=ap-northeast-1 --endpoint-url="https://$LOCALSTACK_HOST:$LOCALSTACK_PORT" --no-verify-ssl s3 rm s3://local-bucket/graph--recursive

# file の入稿
echo "upload file"
aws --region=ap-northeast-1 --endpoint-url="https://$LOCALSTACK_HOST:$LOCALSTACK_PORT" --no-verify-ssl --profile localstack s3 cp ./../sample/sample.json s3://local-bucket/graph/sample.json

# lambda の実行
echo "running lambda"
curl -XPOST http://localhost:9000/2015-03-31/functions/function/invocations -d  @./test/sample_event_valid.json


# 画像fileのダウンロード
aws --region=ap-northeast-1 --endpoint-url="https://$LOCALSTACK_HOST:$LOCALSTACK_PORT" --no-verify-ssl --profile localstack s3 cp s3://local-bucket/graph/sample.png ./sample.png
open ./sample.png