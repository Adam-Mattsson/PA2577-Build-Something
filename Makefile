
listen:
	kubectl port-forward service/frontend-service 5000:80

run: deploy
	kubectl port-forward service/frontend-service 5000:80

restart_images: build
	kubectl rollout restart deployment/frontend-deployment
	kubectl rollout restart deployment/media-catalog-deployment
	kubectl rollout restart deployment/service-recommendation-deployment

deploy: build manifest

build: build_frontend build_media_catalog build_service_recommendation

manifest:
	kubectl apply -f ./k8s

build_frontend:
	docker build -t media-frontend ./frontend

build_media_catalog: ./backend/media-catalog/src/index.js
	docker build -t media-catalog ./backend/media-catalog

build_service_recommendation: ./backend/service-recommendation/app.py
	docker build -t service-recommendation ./backend/service-recommendation

teardown:
	kubectl delete -f ./k8s

log_frontend:
	kubectl logs deployment/frontend-deployment

log_catalog:
	kubectl logs deployment/media-catalog-deployment