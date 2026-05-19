import json

from fastapi import APIRouter, File, HTTPException, UploadFile, status

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
        json.loads(contents)
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON file",
        )

    return {
        "status": "success",
        "filename": file.filename,
        "message": "SBOM uploaded successfully",
    }
