# PA2577 - Build Something

## Setup

Copy `./k8s/example/db-secret-example.yaml` to `./k8s/db-secret.yaml` and set a real password

```shell
cp ./k8s/examples/db-secret-example.yaml ./k8s/db-secret.yaml
```

## Running the Application

### Alternative 1.
1. Run `manifest` to apply k8s manifests
```shell
make manifest
```
2. Run `listen` to port-forward the frontend to localhost:5000
```shell
make listen
```

### Alternative 2. 
Run `run` to apply to execute both `manifest` and `listen`
```shell
make run
```


## Remove the Application
Run `teardown` to remove the manifests from k8s
```shell
make teardown
```