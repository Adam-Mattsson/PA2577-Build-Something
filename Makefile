
listen:
	kubectl port-forward service/frontend-service 5000:80

wait:
	kubectl rollout status deployment/frontend-deployment

run: manifest wait listen

restart_images:
	kubectl rollout restart deployment/frontend-deployment
	kubectl rollout restart deployment/media-catalog-deployment
	kubectl rollout restart deployment/service-recommendation-deployment

manifest:
	kubectl apply -f ./k8s

build_frontend:
	docker build -t adammattsson/media-frontend ./frontend

build_media_catalog: ./backend/media-catalog/src/index.js
	docker build -t adammattsson/media-catalog ./backend/media-catalog

build_service_recommendation: ./backend/service-recommendation/src/index.js
	docker build -t adammattsson/service-recommendation ./backend/service-recommendation

build: build_frontend build_media_catalog build_service_recommendation

push_frontend:
	docker push adammattsson/media-frontend:latest

push_media_catalog:
	docker push adammattsson/media-catalog:latest

push_service_recommendation:
	docker push adammattsson/service-recommendation:latest

push_docker: push_frontend push_media_catalog push_service_recommendation

teardown:
	kubectl delete -f ./k8s

log_frontend:
	kubectl logs deployment/frontend-deployment

log_catalog:
	kubectl logs deployment/media-catalog-deployment

log_service:
	kubectl logs deployment/service-recommendation-deployment
