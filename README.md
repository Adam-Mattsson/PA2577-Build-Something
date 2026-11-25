# PA2577 - Build Something

# Setup

1. Copy `./k8s/example/db-secret-example.yaml` to `./k8s/db-secret.yaml` and set a real password

```shell
cp ./k8s/examples/db-secret-example.yaml ./k8s/db-secret.yaml
```

2. Run `deploy` to create the container images and apply the manifests to k8s

```shell
make deploy
```

3. Run `listen` to port-forward the frontend to localhost:5000 and constantly listen

```shell
make listen
```
