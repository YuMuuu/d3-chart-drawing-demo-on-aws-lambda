# d3-chart-drawing-demo-on-aws-lambda

D3.jsで描画したグラフをAWS lambda上で描画し、png形式でS3にアップロードするための例

see: [AWS lambdaを使ってD3.jsで描画したグラフをpng出力する](https://zenn.dev/paulxll/articles/3931f248d4dd11)

## Requirement

* AWS CLI
* Docker
* terraform
* pkg-config cairo pango libpng jpeg giflib librsvg pixman


## local development (m1 mac)

1. `brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman nodenv`
2. `cd lambda_src`
3. `nodenv install 16.0.0 && nodenv local 16.0.0`
4. `npm_config_target_arch=x64 yarn install`

## How it works

1. `infra-sample` 配下 `*.tf` ファイルを参考にAWSリソースを作成する
2. [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP)フォントを配布元から入手し、 [otf2ttf](https://github.com/awesometoolbox/otf2ttf)などを用いて `.ttf` 形式に変換し、 `/lambda_src/resources/fonts/NotoSansJP-Regular.ttf` に格納する
3. `cd lambda_src` し、 `docker build -t d3-chart-drawing-demo-on-aws-lambda .` を実行しdocker imageをbuildし、任意のECRリポジトリにpushする
4. pushしたimageを参照するlambda関数を作成し、トリガーに任意のS3 Bucketを指定する
5. S3の任意のPATHに `sample/sample.json` をアップロードし、lambdaをキックする
6. 生成された`sample.png` をダウンロードして結果を確認する

## sample

![image](sample/sample.png)
