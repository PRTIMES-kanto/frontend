import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

type Props = {
  originalText?: string;
  anlysisResult?: string;
};

const Analysis = ({ originalText, anlysisResult }: Props) => {
  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel>{originalText}</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
        <pre>{anlysisResult}</pre>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Analysis;
