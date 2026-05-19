import json

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from services.osv_client import check_vulnerabilities
from services.sbom_parser import parse_cyclonedx_sbom
from utils.graph_builder import build_react_flow_graph

router = APIRouter()


@router.post("/api/upload")
async def upload_sbom(file: UploadFile = File(...)):
    if not file.filename.endswith(".json"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .json files are accepted",
        )
    try:
        contents = await file.read()
        data = json.loads(contents)
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON file",
        )

    parsed = parse_cyclonedx_sbom(data)
    vulnerabilities = check_vulnerabilities(parsed.nodes)
    graph = build_react_flow_graph(parsed.nodes, parsed.edges, vulnerabilities)

    return {
        "status": "success",
        "filename": file.filename,
        "message": "SBOM uploaded successfully",
        **graph,
    }
