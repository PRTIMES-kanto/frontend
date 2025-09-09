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
        <div className="">
          <pre>{anlysisResult}</pre>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Analysis;
