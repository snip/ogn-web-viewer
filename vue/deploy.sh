#!/usr/bin/env bash

set -e

# build app
yarn build --modern

# upload files
scp -rC ./dist/* ogn-web-gateway:ogn-web-viewer

# adjust file permissions
ssh ogn-web-gateway "chown -R :www-data ~/ogn-web-viewer"
