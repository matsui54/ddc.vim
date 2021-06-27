import { BaseSource } from "../base/source.ts";
import { Candidate } from "../types.ts";
import { Denops } from "../deps.ts";
import { imap, range } from "https://deno.land/x/itertools@v0.1.2/mod.ts";
import { assertEquals } from "https://deno.land/std@0.98.0/testing/asserts.ts";

function splitPages(
  maxLines: number,
  size: number,
): Iterable<[number, number]> {
  return imap(
    range(1, /* < */ maxLines + 1, size),
    (lnum: number) => [lnum, /* <= */ lnum + size - 1],
  );
}

function allWords(lines: string[]): string[] {
  return lines.flatMap((line) => [...line.matchAll(/[a-zA-Z0-9_]+/g)])
    .map((match) => match[0]);
}

export class Source extends BaseSource {
  async gatherCandidates(denops: Denops): Promise<Candidate[]> {
    const pageSize = 500;
    const maxLines = (await denops.call("line", "$")) as number;
    const pages = (await Promise.all(
      imap(
        splitPages(maxLines, pageSize),
        ([start, end]: [number, number]) => denops.call("getline", start, end),
      ),
    )) as string[][];
    const lines = pages.flatMap((page) => page);

    const candidates: Candidate[] = allWords(lines).map((word) => ({ word }));
    return candidates;
  }
}

Deno.test("pages", () => {
  assertEquals(Array.from(splitPages(600, 500)), [[1, 500], [501, 1000]]);
  assertEquals(Array.from(splitPages(1, 500)), [[1, 500]]);
  assertEquals(Array.from(splitPages(500, 500)), [[1, 500]]);
  assertEquals(Array.from(splitPages(501, 500)), [[1, 500], [501, 1000]]);
});

Deno.test("allWords", () => {
  assertEquals(allWords([]), []);
  assertEquals(allWords(["_w2er"]), ["_w2er"]);
  assertEquals(allWords(["asdf _w2er", "223r wawer"]), [
    "asdf",
    "_w2er",
    "223r",
    "wawer",
  ]);
});
