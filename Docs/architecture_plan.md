# Project: Casino Provider on AWS EKS

**Date:** 2025-04-23
**Version:** 1.0

**Objective:** Develop and deploy a casino provider platform with a microservice architecture (10 games) on AWS using Kubernetes (EKS), Terraform, GitHub Actions, and Grafana.

---

## 1. Architecture Overview

The project utilizes a microservice architecture deployed within an Amazon EKS (Elastic Kubernetes Service) cluster.

**Key Components:**

* **API Gateway:**
    * **Purpose:** Single entry point for external requests, routing to game microservices. Handles auth, rate limiting.
    * **Implementation:** Kubernetes Ingress Controller (Nginx, AWS Load Balancer Controller).
* **Game Microservices:**
    * **Purpose:** Each service implements logic and math for one game (e.g., `coin-flip-service`).
    * **Implementation:** Separate Docker containers (Python/FastAPI) deployed as Kubernetes Deployments/Services (ClusterIP).
* **Database:**
    * **Purpose:** Stores game history, configurations, jackpot data.
    * **Implementation:** Amazon RDS for PostgreSQL, accessed via internal VPC network.
* **Kubernetes Cluster (Orchestration):**
    * **Purpose:** Manages container lifecycle (deployment, scaling, fault tolerance).
    * **Implementation:** Amazon EKS with Managed Node Groups or Fargate Profiles.
* **Monitoring & Logging:**
    * **Purpose:** Collect metrics/logs, visualize system status, alerting.
    * **Implementation:** Prometheus (metrics), Loki (logs), Grafana (visualization), Alertmanager (alerts). Deployed via Helm charts (e.g., `kube-prometheus-stack`, `loki-stack`).
* **CI/CD:**
    * **Purpose:** Automate build, test, and deployment to EKS.
    * **Implementation:** GitHub Actions.

---

## 2. Project Diagram & Request Flow

*(Diagram previously provided via Mermaid syntax, illustrating user -> ALB -> EKS (Ingress -> API GW -> Game Service) -> RDS, with CI/CD and Monitoring interactions).*

**Simplified Request Flow:**

1.  User request hits the public AWS Load Balancer.
2.  Ingress Controller routes request to the internal API Gateway pod.
3.  API Gateway proxies request to the specific Kubernetes Game Service based on the path.
4.  Kubernetes Service load balances to a Game Service pod.
5.  Game Service pod processes logic, interacts with RDS, and returns a response.

---

## 3. Technology Stack

* **Backend:** Python 3.x, FastAPI
* **Database:** PostgreSQL (Amazon RDS)
* **Orchestration:** Amazon EKS (Kubernetes)
* **Containerization:** Docker
* **Container Registry:** AWS ECR
* **IaC:** Terraform
* **CI/CD:** GitHub Actions
* **Monitoring:** Prometheus, Alertmanager, Loki, Promtail, Grafana
* **API Gateway/Ingress:** Nginx Ingress Controller or AWS Load Balancer Controller
* **SCM:** Git + GitHub

---

## 4. DevOps Plan (AWS EKS)

1.  **Source Code Management (SCM):**
    * **Repo:** GitHub (Monorepo recommended).
    * **Structure:** Separate folders for `terraform`, `kubernetes`, `services/<game-name>`, `.github/workflows`.
    * **Branching:** Gitflow (`main`, `develop`, `feature/*`).
2.  **Continuous Integration (CI - GitHub Actions):**
    * **Triggers:** Push/PR to `develop`, `feature/*`.
    * **Steps:** Checkout -> Setup Python -> Lint/Format -> Unit Test (`pytest`) -> (Optional) Security Scan -> Build & Push Docker images (for changed services) to ECR.
3.  **Continuous Deployment (CD - GitHub Actions):**
    * **Triggers:** Merge to `main` (Prod), Manual/Auto from `develop` (Staging).
    * **Steps:** Checkout -> Configure AWS Credentials (OIDC) -> Configure `kubectl` Access (EKS) -> (Optional) Terraform Apply -> Deploy Apps (`kubectl apply` or `helm upgrade`) -> (Optional) DB Migrations -> (Optional) Smoke Tests.
4.  **Infrastructure as Code (IaC - Terraform):**
    * **Managed Resources:** VPC, Subnets, Security Groups, IAM Roles, EKS Cluster, Node Groups, RDS Instance, ECR Repos, (Optional) Helm releases for controllers/monitoring.
    * **Structure:** Use Terraform modules (e.g., official EKS module), remote state (S3).
5.  **Monitoring (Prometheus/Loki/Grafana):**
    * **Deployment:** Helm charts (`kube-prometheus-stack`, `loki-stack`).
    * **Configuration:** Prometheus ServiceMonitors, Promtail log collection, Grafana dashboards (cluster, services, RDS), Alertmanager rules & routing.

---

## 5. Kubernetes Deployment Strategy

* **Game Services:** Use `Deployment` + `Service (ClusterIP)` + (Optional) `HPA`.
* **API Gateway/Ingress:** Use `Deployment` + `Service (LoadBalancer)` + `Ingress` resource.
* **Monitoring:** Deploy via Helm charts.
* **Configuration:** Use Kubernetes `ConfigMaps` and `Secrets`.

---

*This document outlines the high-level plan. Detailed elaboration is required during implementation.*