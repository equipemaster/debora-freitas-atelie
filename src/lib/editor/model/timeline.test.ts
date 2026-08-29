import { describe, it, expect } from "vitest";
import {
  Timeline,
  Clip,
  emptyTimeline,
  DEFAULT_ASPECT_BY_KIND,
  TIMELINE_VERSION,
} from "./timeline";

describe("emptyTimeline", () => {
  it("cria três faixas (vídeo, texto, música) sem clipes", () => {
    const tl = emptyTimeline();
    expect(tl.tracks.map((t) => t.kind)).toEqual(["video", "text", "audio"]);
    expect(tl.tracks.every((t) => t.clips.length === 0)).toBe(true);
    expect(tl.version).toBe(TIMELINE_VERSION);
    expect(tl.durationMs).toBe(0);
  });

  it("respeita o formato pedido", () => {
    expect(emptyTimeline("1:1").aspectRatio).toBe("1:1");
    expect(emptyTimeline().aspectRatio).toBe("9:16");
  });
});

describe("Clip schema", () => {
  it("preenche os defaults a partir do mínimo", () => {
    const clip = Clip.parse({ id: "c1", startMs: 0, durationMs: 1000 });
    expect(clip.assetId).toBeNull();
    expect(clip.transform.scale).toBe(1);
    expect(clip.transform.opacity).toBe(1);
    expect(clip.transitionIn.type).toBe("none");
    expect(clip.volume).toBe(1);
    expect(clip.effects).toEqual([]);
  });

  it("rejeita duração não positiva", () => {
    expect(() => Clip.parse({ id: "c1", startMs: 0, durationMs: 0 })).toThrow();
  });
});

describe("Timeline schema", () => {
  it("aplica bookends da marca por padrão", () => {
    const tl = Timeline.parse({});
    expect(tl.brand.intro).toBe(true);
    expect(tl.brand.outro).toBe(true);
  });

  it("mantém a versão fixa", () => {
    expect(() => Timeline.parse({ version: 999 })).toThrow();
  });
});

describe("DEFAULT_ASPECT_BY_KIND", () => {
  it("sugere vertical para redes e horizontal para making-of", () => {
    expect(DEFAULT_ASPECT_BY_KIND.social).toBe("9:16");
    expect(DEFAULT_ASPECT_BY_KIND.making_of).toBe("16:9");
    expect(DEFAULT_ASPECT_BY_KIND.lookbook).toBe("4:5");
  });
});
