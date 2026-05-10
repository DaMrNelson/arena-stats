export async function parseJsonl<Type>(res: Response) {
  try {
    const buf = await res.clone().bytes();
    let text: string;

    if (buf[0] === 0x1F && buf[1] === 0x8B) {
      console.log("DB is GZIP");
      const ds = new DecompressionStream("gzip");
      const blob = await res.blob();
      const decompressed = blob.stream().pipeThrough(ds);
      text = await new Response(decompressed).text(); // Web APIs never cease to amaze
    } else {
      console.log("DB is plain");
      text = await res.text();
    }

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
  } catch (err) {
    console.error(err);
    throw err;
  }
}
