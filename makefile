#!make
run=docker-compose run

.DEFAULT_GOAL := help

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## install dependencies
	$(run) node npm install

run: ## run compilation + server
	$(run) node ./node_modules/.bin/sass ressources/scss/index.scss public/css/index.css
	docker-compose up
