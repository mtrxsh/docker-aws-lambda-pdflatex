#!/bin/sh
if [ -z "${AWS_LAMBDA_RUNTIME_API}" ]; then
  exec /usr/bin/aws-lambda-rie npx aws-lambda-ric $1
else
  exec npx aws-lambda-ric $1
fi