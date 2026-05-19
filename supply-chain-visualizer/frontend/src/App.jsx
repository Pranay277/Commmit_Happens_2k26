import { useState } from "react";
import UploadModal from "./components/UploadModal";
import DependencyGraph from "./components/DependencyGraph";

export default function App() {
  const [graphData, setGraphData] = useState(null);

  return (
    <>
      <UploadModal onUpload={setGraphData} />
      {graphData && <DependencyGraph data={graphData} />}
    </>
  );
}
