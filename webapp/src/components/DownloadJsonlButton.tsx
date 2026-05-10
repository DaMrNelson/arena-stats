import Button from "react-bootstrap/Button";

export const DownloadJsonlButton = ({ fname, getData }: { fname: string, getData: () => any[] }) => {
  const download = () => {
    const s = getData().map((entry) => JSON.stringify(entry)).join("\n");
    const blob = new Blob([s]);
    const url = window.URL.createObjectURL(blob);

    const e = window.document.createElement("a");
    e.href = url;
    e.download = fname;
    document.body.appendChild(e);
    e.click();
    document.body.removeChild(e);

    window.URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={download}>Download {fname}</Button>
  );
};

export default DownloadJsonlButton;