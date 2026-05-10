// TODO: LICENSE
// Based off:
//   - https://github.com/tajo/react-range/blob/main/examples/TwoThumbsDraggableTrack.tsx
//   - https://github.com/tajo/react-range/blob/main/examples/LabeledMerge.tsx

import { useRef } from "react";
import { Range, getTrackBackground, useThumbOverlap } from "react-range";

export const THUMB_SIZE = 24;
const PRIMARY_COLOR = "#548BF4";
const DISABLED_COLOR = "#95b6f3"

type RangeProps = React.JSX.LibraryManagedAttributes<
  typeof Range,
  React.ComponentProps<typeof Range>
>;
export type StyledRangeProps = (
  Omit<RangeProps, "renderThumb" | "renderTrack">
  & Partial<Pick<RangeProps, "renderThumb" | "renderTrack">>
);

export const StyledRange = ({...props}: StyledRangeProps) => {
  const rangeRef = useRef<Range>(null);

  if (props.renderTrack == null) {
    props.renderTrack = ({ props: renderProps, children }) => (
      <div
        onMouseDown={renderProps.onMouseDown}
        onTouchStart={renderProps.onTouchStart}
        style={{
          ...renderProps.style,
          height: "36px",
          display: "flex",
          width: "100%",
        }}
      >
        <div
          ref={renderProps.ref}
          style={{
            height: "5px",
            width: "100%",
            borderRadius: "4px",
            background: getTrackBackground({
              values: props.values ?? [],
              colors: props.disabled ? ["#ccc", DISABLED_COLOR, "#ccc"] : ["#ccc", PRIMARY_COLOR, "#ccc"],
              min: props.min ?? 0,
              max: props.max ?? 0,
              rtl: props.rtl,
            }),
            alignSelf: "center",
          }}
        >
          {children}
        </div>
      </div>
    )
  }

  if (props.renderThumb == null) {
    props.renderThumb = ({ props: renderProps, index, isDragged }) => (
      <div
        {...renderProps}
        key={renderProps.key}
        style={{
          ...renderProps.style,
          height: `${THUMB_SIZE}px`,
          width: `${THUMB_SIZE}px`,
          borderRadius: "4px",
          backgroundColor: "#FFF",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0px 2px 6px #AAA",
        }}
      >
        <ThumbLabel
          rangeRef={rangeRef.current}
          values={props.values ?? []}
          index={index}
          disabled={props.disabled}
        />
        <div
          style={{
            height: "10px",
            width: "5px",
            backgroundColor: isDragged ? "#548BF4" : "#CCC",
          }}
        />
      </div>
    );
  }

  return (
    <Range ref={rangeRef} {...props as RangeProps} />
  );
};

export const ThumbLabel = ({
  rangeRef,
  values,
  index,
  disabled,
}: {
  rangeRef: Range | null;
  values: number[];
  index: number;
  disabled?: boolean;
}) => {
  const [labelValue, labelStyle] = useThumbOverlap(
    rangeRef,
    values,
    index,
    1,
    " - ",
    (value) => `${value.split(".", 2)[0]}`,
  );
  return (
    <div
      data-label={index}
      style={{
        display: "block",
        position: "absolute",
        top: "28px",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "14px",
        fontFamily: "Arial,Helvetica Neue,Helvetica,sans-serif",
        padding: "4px",
        borderRadius: "4px",
        backgroundColor: disabled ? DISABLED_COLOR : PRIMARY_COLOR,
        whiteSpace: "nowrap",
        ...(labelStyle as React.CSSProperties),
      }}
    >
      {labelValue as string}
    </div>
  );
};


export default StyledRange;
