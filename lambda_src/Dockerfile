FROM public.ecr.aws/lambda/nodejs:16

# ALAS2-2022-1877 対策
RUN yum -y update expat

COPY src/ src/
COPY package.json .
COPY tsconfig.json .
COPY yarn.lock .
# 日本語フォントの.ttfファイルをコンテナ内にCOPYする
COPY resources/fonts resources/fonts

# canvasを立ち上げるために必要な設定
# Error: /lib64/libz.so.1: version `ZLIB_1.2.9' not found (required by /var/task/node_modules/canvas/build/Release/libpng16.so.16) 対策
# see: https://github.com/Automattic/node-canvas/issues/1779
ENV LD_PRELOAD=/var/task/node_modules/canvas/build/Release/libz.so.1
# see: https://github.com/Automattic/node-canvas/issues/1939#issuecomment-1003727738
ENV LD_LIBRARY_PATH=/var/task/node_modules/canvas/build/Release:/var/lang/lib:/lib64:/usr/lib64:/var/runtime:/var/runtime/lib:/var/task:/var/task/lib:/opt/lib
# yarn だけ先にinstallする
RUN npm install -g yarn 

RUN yarn install --frozen-lockfile && yarn build

CMD [ "out/handler.main" ]