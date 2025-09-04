SHELL := /bin/bash
.PHONY: ci-tests

FIREBASE_ID=my-backyard-usa

quasar-build:
	npx quasar build

firebase-cli-auth:
	npx firebase login:add davidordine98@gmail.com

firebase-use-project:
	npx firebase use ${FIREBASE_ID}

firebase-hosting-deploy-website-stg:
	npx quasar build
	npx firebase deploy --only hosting:website-staging

firebase-hosting-deploy-website-prod:
	npx quasar build
	npx firebase deploy --only hosting:website-prod