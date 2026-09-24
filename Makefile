
listen:
	kubectl port-forward service/frontend-service 8080:80

run: deploy
	kubectl port-forward service/frontend-service 8080:80

restart_images:
	kubectl rollout restart deployment/frontend-deployment
	kubectl rollout restart deployment/media-catalog-deployment

deploy: build manifest

build: build_frontend build_media_catalog

manifest:
	kubectl apply -f ./k8s

dev_frontend: ./frontend/app.py
	flask --app ./frontend/app.py run --host=0.0.0.0 --port=5000 --debug

build_frontend: ./frontend/app.py
	docker build -t media-frontend ./frontend

build_media_catalog: ./backend/media-catalog/app.py
	docker build -t media-catalog ./backend/media-catalog

teardown:
	kubectl delete -f ./k8s