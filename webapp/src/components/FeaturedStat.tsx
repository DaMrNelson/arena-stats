export const FeaturedStat = ({ val, label, sublabel }: { val: any, label: string | React.ReactNode, sublabel: string }) => (
  <div className="text-center" style={{ padding: "0 1em" }}>
    <h3 className="display-3" style={{ lineHeight: "" }}>
      { typeof val === "number" ? val.toLocaleString() : val }
    </h3>
    <div style={{ fontSize: "1.2em", fontWeight: "bold" }}>{label}</div>
    <div>{sublabel}</div>
  </div>
);

export default FeaturedStat;
