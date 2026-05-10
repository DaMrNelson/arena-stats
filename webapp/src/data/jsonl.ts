export async function parseJsonl<Type>(res: Response) {
  //const ds = new DecompressionStream("gzip");
  //const blob = await res.blob();
  //const decompressed = blob.stream().pipeThrough(ds);
  //const text = await new Response(decompressed).text(); // Web APIs never cease to amaze
  const text = await res.text(); // Library/browser handles gzip decoding for us... neat!

  return text.split("\n").reduce((entries, line) => {
    line = line.trim();

    if (line.length) {
      try {
        entries.push(JSON.parse(line));
      } catch (err) {
        console.warn("Failed to parse line of JSONL! It will be skipped.");
        console.warn(err);
      }
    }

    return entries;
  }, [] as Type[]);
}
