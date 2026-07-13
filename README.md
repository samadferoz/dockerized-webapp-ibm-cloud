# Dockerized Web App Deployment on IBM Cloud

A simple Node.js (Express) web application, containerized using **Docker**, and ready to be deployed on **IBM Cloud** (Code Engine or Kubernetes Service).

## 📌 Project Overview

This project demonstrates:
- Building a lightweight web app with Node.js + Express
- Containerizing the app using Docker
- Pushing the Docker image to **IBM Cloud Container Registry**
- Deploying the containerized app on **IBM Cloud Code Engine**

## 🗂️ Project Structure

```
dockerized-webapp-ibm-cloud/
├── app.js              # Express server
├── package.json        # Node dependencies
├── Dockerfile           # Docker build instructions
├── .dockerignore
├── public/
│   └── index.html       # Simple frontend
└── README.md
```

## 🚀 Run Locally (without Docker)

```bash
npm install
npm start
```

App will run at: `http://localhost:3000`

## 🐳 Run with Docker (Locally)

1. **Build the Docker image**
   ```bash
   docker build -t dockerized-webapp .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 dockerized-webapp
   ```

3. Open browser at `http://localhost:3000`

## ☁️ Deploy on IBM Cloud

### Prerequisites
- [IBM Cloud account](https://cloud.ibm.com/registration) (free tier works)
- [IBM Cloud CLI](https://cloud.ibm.com/docs/cli) installed
- Docker installed locally

### Step 1: Login to IBM Cloud CLI
```bash
ibmcloud login
ibmcloud target --cf
```

### Step 2: Install Container Registry plugin
```bash
ibmcloud plugin install container-registry
```

### Step 3: Create a namespace in IBM Cloud Container Registry
```bash
ibmcloud cr login
ibmcloud cr namespace-add <your-namespace>
```

### Step 4: Build and tag the Docker image for IBM Cloud
```bash
docker build -t us.icr.io/<your-namespace>/dockerized-webapp:1.0 .
```

### Step 5: Push image to IBM Cloud Container Registry
```bash
docker push us.icr.io/<your-namespace>/dockerized-webapp:1.0
```

### Step 6: Deploy on IBM Cloud Code Engine

```bash
ibmcloud ce project create --name dockerized-webapp-project
ibmcloud ce project select --name dockerized-webapp-project

ibmcloud ce application create \
  --name dockerized-webapp \
  --image us.icr.io/<your-namespace>/dockerized-webapp:1.0 \
  --registry-secret icr-secret \
  --port 3000
```

### Step 7: Get the public URL
```bash
ibmcloud ce application get --name dockerized-webapp
```

IBM Cloud will give you a public HTTPS URL where the app is live.

## 🔍 API Endpoints

| Route         | Description                          |
|---------------|---------------------------------------|
| `/`           | Frontend home page                    |
| `/health`     | Health check (used by IBM Cloud probes) |
| `/api/info`   | Returns JSON app info + hostname      |

## 🛠️ Tech Stack
- Node.js + Express
- Docker
- IBM Cloud Container Registry
- IBM Cloud Code Engine

## 📄 License
MIT
