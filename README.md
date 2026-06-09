# 🚀 Shortly - Cloud Native URL Shortener with CI/CD & Monitoring

## 📌 Project Overview

Shortly is a modern URL Shortener application deployed on AWS using a complete DevOps workflow.

This project demonstrates:

* Docker Containerization
* Kubernetes Deployment
* Jenkins CI/CD Automation
* GitHub Webhook Integration
* Prometheus Monitoring
* Grafana Visualization
* AWS Cloud Deployment

Whenever code is pushed to GitHub, Jenkins automatically builds a new Docker image and deploys the updated application to Kubernetes without downtime.

---

## 🏗️ Architecture

Developer → GitHub → GitHub Webhook → Jenkins → Docker → Kubernetes → Application

Monitoring:

Node Exporter + cAdvisor → Prometheus → Grafana

---

## ☁️ AWS Services Used

| Service     | Purpose                                                    |
| ----------- | ---------------------------------------------------------- |
| EC2         | Hosts Jenkins, Docker, Kubernetes, Prometheus, and Grafana |
| Lambda      | Backend URL shortening logic                               |
| API Gateway | API endpoint management                                    |
| DynamoDB    | Stores URLs and analytics                                  |
| Cognito     | User authentication                                        |
| IAM         | Permissions and security                                   |
| CloudWatch  | Logging and monitoring                                     |

---

## 🛠️ DevOps Tools Used

| Tool              | Purpose                      |
| ----------------- | ---------------------------- |
| GitHub            | Source code management       |
| Jenkins           | CI/CD automation             |
| Docker            | Application containerization |
| Kubernetes (Kind) | Container orchestration      |
| Prometheus        | Metrics collection           |
| Grafana           | Visualization dashboards     |
| Node Exporter     | Host monitoring              |
| cAdvisor          | Container monitoring         |

---

## 🚀 CI/CD Workflow

1. Developer pushes code to GitHub.
2. GitHub Webhook triggers Jenkins.
3. Jenkins pulls latest code.
4. Jenkins builds a Docker image.
5. Image is loaded into the Kubernetes cluster.
6. Kubernetes performs a rolling update.
7. New version becomes available without downtime.

---

## ☸️ Kubernetes Deployment

Features implemented:

* Multiple replicas
* Rolling updates
* Self-healing pods
* Service-based access
* High availability

Example:

```yaml
replicas: 2
```

---

## 📊 Monitoring Stack

### Node Exporter

Collects:

* CPU Usage
* Memory Usage
* Disk Usage
* Network Metrics

### cAdvisor

Collects:

* Container CPU Usage
* Container Memory Usage
* Container Network Usage

### Prometheus

Responsible for:

* Metrics collection
* Metrics storage
* Querying metrics

### Grafana

Provides:

* Real-time dashboards
* Infrastructure monitoring
* Visualization of metrics

---

## 📸 Project Screenshots

### Application

Add application screenshot here.

### Jenkins CI/CD Pipeline

Add Jenkins pipeline screenshot here.

### Kubernetes Deployment

Add kubectl get pods screenshot here.

### Prometheus Monitoring

Add Prometheus targets screenshot here.

### Grafana Dashboard

Add Grafana dashboard screenshot here.

---

## 🔧 Useful Commands

### Kubernetes

```bash
kubectl get pods

kubectl get deployment

kubectl get svc

kubectl rollout restart deployment/shortly
```

### Docker

```bash
docker ps

docker images
```

---

## 🎯 Key Features

* Automated CI/CD Pipeline
* GitHub Webhook Integration
* Dockerized Application
* Kubernetes Deployment
* Rolling Updates
* Self-Healing Infrastructure
* Infrastructure Monitoring
* Container Monitoring
* Real-Time Dashboards
* AWS Cloud Deployment

---

## 📚 Skills Demonstrated

* AWS Cloud
* Linux Administration
* GitHub
* Jenkins
* Docker
* Kubernetes
* CI/CD Automation
* Prometheus
* Grafana
* Monitoring & Observability

---

## 🔮 Future Improvements

* Terraform Infrastructure as Code
* Amazon EKS Deployment
* AWS ECR Image Registry
* Helm Charts
* NGINX Ingress Controller
* ArgoCD GitOps
* Multi-Environment Deployment

---

## 👨‍💻 Author

**Sathish C**

Cloud & DevOps Engineer

Focused on:

* AWS Cloud
* Kubernetes
* Docker
* Terraform
* CI/CD
* Monitoring & Observability

---

⭐ If you found this project useful, feel free to star the repository.
