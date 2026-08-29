import { describe, it, expect } from "vitest";
import {
  WizardAnswers,
  emptyWizardAnswers,
  TakeChoice,
  WIZARD_VERSION,
} from "./wizard";

describe("emptyWizardAnswers", () => {
  it("começa sem takes, música padrão e não concluído", () => {
    const a = emptyWizardAnswers();
    expect(a.version).toBe(WIZARD_VERSION);
    expect(a.takes).toEqual([]);
    expect(a.music.assetId).toBeNull();
    expect(a.music.mood).toBe("elegante-lenta");
    expect(a.music.cutOnBeat).toBe(true);
    expect(a.completedOnce).toBe(false);
  });
});

describe("TakeChoice schema", () => {
  it("exige ao menos um asset escolhido", () => {
    expect(() =>
      TakeChoice.parse({ sceneTag: "cena-1", chosenAssetIds: [], order: 0 }),
    ).toThrow();
  });

  it("aceita múltiplos assets (usar os dois)", () => {
    const t = TakeChoice.parse({
      sceneTag: "cena-1",
      chosenAssetIds: ["a", "b"],
      order: 2,
    });
    expect(t.chosenAssetIds).toHaveLength(2);
    expect(t.order).toBe(2);
  });
});

describe("WizardAnswers schema", () => {
  it("valida um conjunto completo de respostas", () => {
    const parsed = WizardAnswers.parse({
      takes: [{ sceneTag: "s1", chosenAssetIds: ["x"], order: 0 }],
      music: { assetId: "m1", mood: "energetica", cutOnBeat: false },
      completedOnce: true,
    });
    expect(parsed.music.mood).toBe("energetica");
    expect(parsed.takes[0].sceneTag).toBe("s1");
  });

  it("rejeita clima desconhecido", () => {
    expect(() =>
      WizardAnswers.parse({ music: { mood: "epica" } }),
    ).toThrow();
  });
});
