from pydantic import BaseModel


class PackageNode(BaseModel):
    id: str
    name: str
    version: str


class DependencyEdge(BaseModel):
    source: str
    target: str


class ParsedSBOM(BaseModel):
    nodes: list[PackageNode]
    edges: list[DependencyEdge]
