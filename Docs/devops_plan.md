# Detailed DevOps Work Plan (Casino Provider on AWS EKS)

**Date:** 2025-04-23
**Version:** 1.0

**Objective:** Define specific steps and tasks for implementing DevOps practices within the "Casino Provider" project on AWS EKS.

---

## Phase 1: Foundation Setup

**Goal:** Establish the groundwork for development, CI/CD, and infrastructure.

1.  **Source Code Management (SCM):**
    * [ ] **Task:** Create a repository on GitHub.
    * [ ] **Task:** Choose and set up the repository structure (monorepo).
        * Create folders: `/terraform`, `/kubernetes`, `/services`, `/.github/workflows`, `/scripts`.
    * [ ] **Task:** Configure a basic `.gitignore` for Python and Terraform.
    * [ ] **Task:** Define and document the branching strategy (Gitflow: `main`, `develop`, `feature/*`).
    * [ ] **Task:** Set up branch protection rules for `main` and `develop` (require PR, require status checks to pass).

2.  **Infrastructure as Code (IaC - Terraform):**
    * [ ] **Task:** Configure Terraform remote state backend (S3 backend + DynamoDB locking).
    * [ ] **Task:** Begin describing the basic network infrastructure in Terraform:
        * VPC, public and private subnets, route tables, Internet Gateway, NAT Gateway.
        * Basic Security Groups.
    * [ ] **Task:** Begin describing basic IAM roles and policies in Terraform (e.g., for GitHub Actions OIDC, EKS Cluster Role).

3.  **Local Environment:**
    * [ ] **Task:** Create a `Dockerfile` for one of the game services (e.g., `coin-flip`).
    * [ ] **Task:** Create a basic `docker-compose.yml` for running the service and PostgreSQL locally.
    * [ ] **Task:** Write scripts to simplify local start/stop (`./scripts/start-local.sh`, `./scripts/stop-local.sh`).

---

## Phase 2: Development & Continuous Integration (CI)

**Goal:** Start microservice development, set up automated build and testing.

1.  **Microservice Development:**
    * [ ] **Task:** Implement basic logic and API for the first 1-2 game services (Python/FastAPI).
    * [ ] **Task:** Write Unit Tests (`pytest`) for mathematical models and core service logic.
    * [ ] **Task:** Add Prometheus metrics export to services (e.g., `prometheus-fastapi-instrumentator`).
    * [ ] **Task:** Configure structured logging (JSON) in services.

2.  **Continuous Integration (CI - GitHub Actions):**
    * [ ] **Task:** Create the initial CI workflow (`.github/workflows/ci.yml`).
    * [ ] **Task:** Configure CI steps:
        * Checkout Code.
        * Setup Python.
        * Cache pip dependencies.
        * Install dependencies (`requirements.txt`).
        * Linting (`flake8`, `black`).
        * Run Unit Tests (`pytest`) with coverage report generation.
    * [ ] **Task:** Configure the CI workflow to run on Push/PR to `develop` and `feature/*`.
    * [ ] **Task:** Add a step to build Docker images for changed services in CI (without pushing at this stage).

---

## Phase 3: AWS Infrastructure Setup & Continuous Deployment (CD)

**Goal:** Prepare the cloud infrastructure and automate deployment to AWS EKS.

1.  **Infrastructure as Code (IaC - Terraform):**
    * [ ] **Task:** Describe EKS cluster creation in Terraform (using the EKS module).
    * [ ] **Task:** Describe Managed Node Group creation.
    * [ ] **Task:** Describe RDS for PostgreSQL instance creation in Terraform.
    * [ ] **Task:** Describe ECR repository creation for services.
    * [ ] **Task:** Configure access to EKS from GitHub Actions (IAM OIDC Provider).
    * [ ] **Task:** Apply Terraform to create the basic AWS infrastructure.

2.  **Continuous Deployment (CD - GitHub Actions):**
    * [ ] **Task:** Create the CD workflow (`.github/workflows/deploy.yml`).
    * [ ] **Task:** Configure CD triggers (e.g., merge to `main`).
    * [ ] **Task:** Add steps in CI to push images to ECR (on merge to `develop`/`main`).
    * [ ] **Task:** Configure CD steps:
        * Checkout Code.
        * Configure AWS Credentials (OIDC).
        * Configure `kubectl` Access (EKS).
        * **(Optional):** Step for `terraform apply` (could be a separate workflow).
        * Deploy applications using `kubectl apply` or `helm upgrade`.
    * [ ] **Task:** Create basic Kubernetes manifests (Deployment, Service) for 1-2 services in the `/kubernetes` folder.

3.  **Kubernetes Configuration:**
    * [ ] **Task:** Install AWS Load Balancer Controller in the cluster (via Helm, potentially managed by Terraform).
    * [ ] **Task:** Create a basic Ingress resource for routing to one of the services.
    * [ ] **Task:** Configure Kubernetes Secrets for RDS access from pods.

---

## Phase 4: Monitoring & Finalization

**Goal:** Set up comprehensive monitoring, deploy all services, prepare the project for demonstration.

1.  **Monitoring (Prometheus/Loki/Grafana):**
    * [ ] **Task:** Deploy `kube-prometheus-stack` and `loki-stack` to EKS (via Helm, potentially managed by Terraform).
    * [ ] **Task:** Configure Prometheus to scrape metrics from game services (ServiceMonitors).
    * [ ] **Task:** Ensure Promtail is collecting logs from pods.
    * [ ] **Task:** Configure Grafana:
        * Add data sources (Prometheus, Loki).
        * Create basic dashboards (cluster health, service performance, logs).
    * [ ] **Task:** Configure Alertmanager with 1-2 basic alerting rules (e.g., Pod CrashLoopBackOff).

2.  **Deploy All Services:**
    * [ ] **Task:** Create Dockerfiles and Kubernetes manifests for all remaining game services.
    * [ ] **Task:** Update CI/CD to build and deploy all services.
    * [ ] **Task:** Configure Ingress resources for all services.

3.  **Testing and Documentation:**
    * [ ] **Task:** Perform integration testing of the API via the API Gateway.
    * [ ] **Task:** Verify monitoring and alerting functionality.
    * [ ] **Task:** Finalize project documentation (README, architecture description, setup steps, DevOps configuration).

---

**Ongoing Tasks (Throughout All Phases):**

* Regularly update dependencies (Python, Terraform providers, Helm charts).
* Review and analyze logs and metrics.
* Keep documentation up-to-date.
* Optimize CI/CD pipelines.
* Manage AWS resource costs.

---
*This plan is indicative and may be adjusted during the project.*
