import React from "react";
import { registerRoot, Composition, Still, CalculateMetadataFunction } from "remotion";
import { Tostadora3D, Props } from "./Composition";
import { Cover } from "./Cover";
import timingDefault from "./timing.json";

const calc: CalculateMetadataFunction<Props> = ({ props }) => ({
  durationInFrames: Math.ceil(props.timing.duration * 30),
});

const Root: React.FC = () => (
  <>
    <Composition id="Tostadora3D" component={Tostadora3D} fps={30} width={1080} height={1920}
      durationInFrames={2958} defaultProps={{ timing: timingDefault as any, quality: "final", debug: false }} calculateMetadata={calc} />
    <Still id="Portada" component={Cover} width={1080} height={1920} />
  </>
);
registerRoot(Root);
