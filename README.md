## 📖 Project Overview

Modern software is built on thousands of open-source dependencies. A single vulnerable transitive dependency can compromise an entire enterprise infrastructure. **ShieldGraph** (SBOM-Based Supply Chain Vulnerability Visualizer) is a cutting-edge cybersecurity platform designed to map, analyze, and secure your software supply chain. 

By ingesting standard **CycloneDX SBOM** (Software Bill of Materials) JSON files, the platform constructs an interactive, severity-color-coded dependency graph. It automatically queries the massive **Open Source Vulnerability (OSV) database** to detect known CVEs within the trust chain, and leverages a localized **Llama 3 AI model (via Ollama)** to generate secure, context-aware remediation strategies without exposing sensitive architecture data to external cloud APIs.

## 🚨 Problem Statement

The lack of visibility into software supply chains is a critical security blind spot. Traditional vulnerability scanners output massive, unreadable CSV or text reports, making it nearly impossible for security teams to understand the blast radius of a compromised package. Furthermore, sending proprietary dependency trees to third-party cloud AI APIs for remediation analysis poses a severe data privacy risk. 

**ShieldGraph solves this by providing:**
1. Visual context to complex dependency networks.
2. Immediate threat identification via live OSV threat intelligence.
3. 100% private, localized AI remediation guidance.

---

## ✨ Features

- **Upload CycloneDX JSON SBOM Files:** Seamlessly parse standard software bill of materials.
- **Deep Dependency Parsing:** Extract and map hierarchical software component relationships.
- **Real-Time Threat Detection:** Detect known vulnerabilities using the live OSV API.
- **Interactive Graph Visualization:** Navigate complex trust-chains using an interactive React Flow graph.
- **Severity-Based Node Coloring:** Instantly identify Critical, High, Medium, and Low risk packages.
- **Risk Summary Dashboard:** Get high-level metrics on the security posture of the uploaded project.
- **Node Inspector & CVE Details:** Click on any node to view specific vulnerability details, IDs, and CVSS scores.
- **Exportable PDF Security Reports:** Generate comprehensive compliance reports with a single click.
- **AI-Generated Remediation:** Receive intelligent, step-by-step mitigation strategies for vulnerable nodes.
- **Zero Cloud Exposure for AI:** All AI processing runs completely offline using localized Ollama + Llama3.

---

## 🏗️ Architecture & Workflow

### Clean Architecture
ShieldGraph uses a decoupled client-server architecture:
- **Frontend (React + Vite):** Handles user interactions, SBOM file uploads, interactive graph rendering, and localized state management.
- **Backend (FastAPI):** Acts as the high-performance data processing engine. It parses the SBOM, asynchronously fetches threat intelligence from the OSV API, constructs the graph data structures, and orchestrates the local AI engine.

### API Workflow
1. Client uploads a `sbom.json` to the FastAPI backend.
2. Backend parses the CycloneDX schema and extracts packages (`pkg:purl`).
3. Backend queries the OSV API to retrieve active vulnerabilities for each package.
4. Backend formats the hierarchical data and returns a structured graph JSON.

### AI Integration Workflow
- **Vulnerability Detection:** Uses the OSV API (online) to guarantee access to the latest global threat intelligence.
- **AI Explanation & Remediation:** Runs locally using Ollama + Llama3. When a user requests an insight for a vulnerable node, the backend securely prompts the local model, ensuring proprietary dependency architectures never leave the host machine.

---

## 💻 Tech Stack

**Frontend:**
- ⚛️ React 18
- ⚡ Vite
- 🕸️ React Flow (Graph Visualization)
- 📡 Axios
- 📝 React Markdown

**Backend:**
- 🚀 FastAPI
- 🐍 Python 3.10+
- 🌐 httpx (Async API requests)
- 🧠 Ollama (Llama 3 Local AI Engine)

---

## 📂 Project Structure

```text
supply-chain-visualizer/
├── backend/
│   ├── api/
│   ├── config/
│   ├── data/
│   ├── models/
│   ├── services/
│   ├── utils/
│   ├── tests/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── mock/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Installation & Setup Guide

### 1. Backend Setup

Navigate to the backend directory, set up a virtual environment, and install the dependencies:

```bash
cd backend
python -m venv .supply
# On Windows:
.supply\Scripts\activate
# On Mac/Linux:
# source .supply/bin/activate

pip install -r requirements.txt
```

Run the backend server:
```bash
uvicorn main:app --reload
```
*The API will be available at `http://localhost:8000`*

### 2. Frontend Setup

Open a new terminal window, navigate to the frontend directory, and start the development server:

```bash
cd frontend
npm install
npm run dev
```
*The frontend will be available at `http://localhost:5173` (or `5174` depending on Vite configuration).*

### 3. Ollama Setup (Local AI Engine)

To enable the secure, localized AI remediation engine, you must install Ollama and the Llama 3 model on your host machine.

1. **Install Ollama:** Download from [ollama.com](https://ollama.com)
2. **Pull the Llama 3 model:** Open a terminal and run:
   ```bash
   ollama pull llama3
   ```
3. **Verify it's running:** Ensure the Ollama background service is active. You can test it via:
   ```bash
   ollama run llama3
   ```

---

## 🏃 Running the Project

1. Start the **Ollama** engine in the background.
2. Start the **FastAPI Backend** (`uvicorn main:app --reload`).
3. Start the **React Frontend** (`npm run dev`).
4. Open your browser and navigate to the frontend URL.
5. Upload a standard `CycloneDX JSON` file and let ShieldGraph map your supply chain!

---

## 📸 Screenshots

*(Placeholder: Add your project screenshots here)*

- **Landing Page:** `[landing-page.png]`
- **Upload Modal:** `[upload-modal.png]`
- **Dependency Graph View:** `[dependency-graph.png]`
- **AI Remediation Details:** `[ai-insight.png]`
- **PDF Report Generation:** `[pdf-report.png]`

---

## 🔮 Future Improvements

- Add support for SPDX SBOM formats.
- Integrate automated Git Repository scanning.
- Add real-time WebSocket updates for massive dependency trees.
- Implement user authentication and Role-Based Access Control (RBAC) for team deployments.

---

## 👥 Contributors

- **Pranay** - Core Developer & Architect

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
