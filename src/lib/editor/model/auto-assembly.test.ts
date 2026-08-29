import { describe, it, expect } from "vitest";
import {
  buildTimeline,
  distributeDurations,
  snapToBeats,
  transitionForMood,
  INTRO_MS,
  OUTRO_MS,
  MIN_SCENE_MS,
  DUCKED_VOLUME,
  type MediaMeta,
} from "./auto-assembly";
import { emptyWizardAnswers } from "./wizard";

function media(id: string, sceneTag: string, durationMs: number): MediaMeta {
  return { id, kind: "video", sceneTag, takeNumber: 1, durationMs };
}

describe("distributeDurations", () => {
  it("aplica um piso mínimo por clipe", () => {
    expect(distributeDurations([200, 300])).toEqual([MIN_SCENE_MS, MIN_SCENE_MS]);
  });

  it("escala para se aproximar do alvo", () => {
    const out = distributeDurations([4000, 4000], 4000);
    const total = out.reduce((a, b) => a + b, 0);
    expect(total).toBeLessThanOrEqual(4000 + MIN_SCENE_MS);
    expect(out.every((d) => d >= MIN_SCENE_MS)).toBe(true);
  });

  it("sem alvo, devolve as durações originais (com piso)", () => {
    expect(distributeDurations([5000, 6000])).toEqual([5000, 6000]);
  });
});

describe("snapToBeats", () => {
  it("leva cada corte para a batida mais próxima", () => {
    expect(snapToBeats([950, 2100], [0, 1000, 2000, 3000])).toEqual([1000, 2000]);
  });

  it("sem batidas, mantém os cortes", () => {
    expect(snapToBeats([950, 2100], [])).toEqual([950, 2100]);
  });
});

describe("transitionForMood", () => {
  it("corte seco para clima energético / minimal / sem música", () => {
    expect(transitionForMood("energetica").type).toBe("none");
    expect(transitionForMood("minimal").type).toBe("none");
    expect(transitionForMood("sem-musica").type).toBe("none");
  });

  it("crossfade para clima elegante / romântico", () => {
    expect(transitionForMood("elegante-lenta").type).toBe("crossfade");
    expect(transitionForMood("romantica").type).toBe("crossfade");
  });
});

describe("buildTimeline", () => {
  const answers = (() => {
    const a = emptyWizardAnswers();
    a.takes = [
      { sceneTag: "s1", chosenAssetIds: ["a1"], order: 0 },
      { sceneTag: "s2", chosenAssetIds: ["a2"], order: 1 },
    ];
    return a;
  })();

  const items = [media("a1", "s1", 4000), media("a2", "s2", 5000)];

  it("insere abertura e encerramento da marca na faixa de vídeo", () => {
    const tl = buildTimeline({ aspectRatio: "9:16", answers, media: items, brand: { name: "Ateliê" } });
    const video = tl.tracks.find((t) => t.kind === "video")!;
    expect(video.clips[0].text?.preset).toBe("title-card");
    expect(video.clips[0].durationMs).toBe(INTRO_MS);
    expect(video.clips.at(-1)?.text?.preset).toBe("end-card");
    expect(video.clips.at(-1)?.durationMs).toBe(OUTRO_MS);
  });

  it("os clipes de conteúdo ficam em sequência, sem sobreposição", () => {
    const tl = buildTimeline({ aspectRatio: "9:16", answers, media: items });
    const video = tl.tracks.find((t) => t.kind === "video")!;
    const content = video.clips.filter((c) => c.assetId !== null);
    expect(content).toHaveLength(2);
    expect(content[0].startMs + content[0].durationMs).toBe(content[1].startMs);
    expect(content[0].assetId).toBe("a1");
    expect(content[1].assetId).toBe("a2");
  });

  it("faz ducking do áudio das cenas quando há trilha", () => {
    const withMusic = { ...answers, music: { ...answers.music, assetId: "m1" } };
    const tl = buildTimeline({ aspectRatio: "9:16", answers: withMusic, media: items });
    const video = tl.tracks.find((t) => t.kind === "video")!;
    const content = video.clips.filter((c) => c.assetId !== null);
    expect(content.every((c) => c.volume === DUCKED_VOLUME)).toBe(true);

    const audio = tl.tracks.find((t) => t.kind === "audio")!;
    expect(audio.clips).toHaveLength(1);
    expect(audio.clips[0].assetId).toBe("m1");
    expect(audio.clips[0].durationMs).toBe(tl.durationMs);
  });

  it("sem música escolhida, não cria clipe de áudio e mantém volume cheio", () => {
    const tl = buildTimeline({ aspectRatio: "9:16", answers, media: items });
    const audio = tl.tracks.find((t) => t.kind === "audio")!;
    expect(audio.clips).toHaveLength(0);
    const video = tl.tracks.find((t) => t.kind === "video")!;
    expect(video.clips.filter((c) => c.assetId).every((c) => c.volume === 1)).toBe(true);
  });

  it("a duração total soma abertura + conteúdo + encerramento", () => {
    const tl = buildTimeline({ aspectRatio: "9:16", answers, media: items });
    const video = tl.tracks.find((t) => t.kind === "video")!;
    const somaClipes = video.clips.reduce((a, c) => a + c.durationMs, 0);
    expect(tl.durationMs).toBe(somaClipes);
  });

  it("segunda cena em diante ganha transição conforme o clima", () => {
    const romantic = { ...answers, music: { ...answers.music, assetId: "m1", mood: "romantica" as const } };
    const tl = buildTimeline({ aspectRatio: "9:16", answers: romantic, media: items });
    const video = tl.tracks.find((t) => t.kind === "video")!;
    const content = video.clips.filter((c) => c.assetId !== null);
    expect(content[0].transitionIn.type).toBe("none");
    expect(content[1].transitionIn.type).toBe("crossfade");
  });
});
