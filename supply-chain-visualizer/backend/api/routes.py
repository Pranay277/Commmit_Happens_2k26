import json

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from services.sbom_parser import parse_cyclonedx_sbom

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

    return {
        "status": "success",
        "filename": file.filename,
        "message": "SBOM uploaded successfully",
        "nodes": [n.model_dump() for n in parsed.nodes],
        "edges": [e.model_dump() for e in parsed.edges],
    }
