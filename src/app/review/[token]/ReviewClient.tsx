"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { cn, formatTimecode } from "@/lib/utils";

type Comment = {
  id: string;
  author_name: string;
  body: string;
  timecode_ms: number | null;
  resolved: boolean;
  created_at: string;
};

type ReviewData = {
  project: {
    id: string;
    title: string;
    kind: keyof typeof t.projectKind;
    status: keyof typeof t.projectStatus;
    aspect_ratio: string;
    resolution: string;
    duration_ms: number;
  };
  videoUrl: string | null;
  comments: Comment[];
  allowComments: boolean;
};

const NAME_STORAGE_KEY = "review-reviewer-name";

async function callReviewAccess<T>(
  token: string,
  action: "resolve" | "comment" | "approve",
  extra: Record<string, unknown> = {},
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!baseUrl || !anonKey) {
    throw new Error("Supabase não configurado neste ambiente.");
  }

  const res = await fetch(`${baseUrl}/functions/v1/review-access`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    },
    body: JSON.stringify({ token, action, ...extra }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new Error(json?.error ?? t.errors.generic);
  }
  return json.data as T;
}

function readStoredName(): string {
  try {
    return window.localStorage.getItem(NAME_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function storeName(name: string) {
  try {
    window.localStorage.setItem(NAME_STORAGE_KEY, name);
  } catch {
    // localStorage indisponível (janela privada etc.) — segue sem lembrar o nome.
  }
}

export function ReviewClient({ token }: { token: string }) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; data: ReviewData }
  >({ status: "loading" });

  const [name, setName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [note, setNote] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [sendingDecision, setSendingDecision] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [decisionMessage, setDecisionMessage] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    // localStorage só existe no cliente; ler o nome guardado é uma sincronização
    // pontual com esse sistema externo no mount, não um valor derivável do render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(readStoredName());
  }, []);

  // Busca de dados no mount/troca de token. TODO(fase 1): migrar para
  // TanStack Query (já é dependência do projeto) quando o QueryClientProvider
  // for introduzido no layout raiz — hoje ainda não existe nenhum no app.
  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const data = await callReviewAccess<ReviewData>(token, "resolve");
        if (!cancelled) setState({ status: "ready", data });
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : t.errors.generic,
          });
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token, retryTick]);

  function retry() {
    setState({ status: "loading" });
    setRetryTick((n) => n + 1);
  }

  if (state.status === "loading") {
    return <p className="text-sm text-muted">{t.review.loading}</p>;
  }

  if (state.status === "error") {
    return (
      <div className="border border-dashed border-border p-10 text-center">
        <p className="display text-xl">{state.message}</p>
        <Button variant="outline" className="mt-6" onClick={retry}>
          {t.review.tryAgain}
        </Button>
      </div>
    );
  }

  const { data } = state;
  const { project } = data;

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!name.trim() || !commentBody.trim()) return;

    setSendingComment(true);
    try {
      const comment = await callReviewAccess<Comment>(token, "comment", {
        authorName: name.trim(),
        body: commentBody.trim(),
      });
      storeName(name.trim());
      setCommentBody("");
      setState((prev) =>
        prev.status === "ready"
          ? { ...prev, data: { ...prev.data, comments: [...prev.data.comments, comment] } }
          : prev,
      );
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t.errors.generic);
    } finally {
      setSendingComment(false);
    }
  }

  async function submitDecision(decision: "approved" | "changes_requested") {
    if (!name.trim()) {
      setFormError(t.review.yourName);
      return;
    }
    setFormError(null);
    setSendingDecision(true);
    try {
      await callReviewAccess(token, "approve", {
        decision,
        decidedByName: name.trim(),
        note: note.trim() || undefined,
      });
      storeName(name.trim());
      setDecisionMessage(t.review.decisionRecorded);
      setNote("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t.errors.generic);
    } finally {
      setSendingDecision(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow mb-2">{t.projectKind[project.kind]}</p>
        <h1 className="display text-3xl md:text-4xl">{project.title}</h1>
        <p className="mt-2 text-sm text-muted">
          {t.projectStatus[project.status]} · {project.aspect_ratio} · {project.resolution}
        </p>
      </div>

      <Card>
        <CardBody className="p-0">
          {data.videoUrl ? (
            <video controls className="aspect-video w-full bg-ink" src={data.videoUrl} />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center bg-block p-8 text-center">
              <p className="text-sm text-muted">{t.review.videoNotReady}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {formError ? <p className="text-sm text-danger">{formError}</p> : null}

      {decisionMessage ? (
        <Card>
          <CardBody>
            <p className="text-sm">{decisionMessage}</p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="eyebrow">{t.review.yourName}</span>
            <input
              className="h-10 border border-border bg-background px-3 text-sm outline-none focus-visible:border-ink"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.review.yourName}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="eyebrow">{t.review.noteOptional}</span>
            <textarea
              className="min-h-20 border border-border bg-background p-3 text-sm outline-none focus-visible:border-ink"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.review.noteOptional}
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <Button
              disabled={sendingDecision}
              onClick={() => submitDecision("approved")}
            >
              {t.review.approve}
            </Button>
            <Button
              variant="outline"
              disabled={sendingDecision}
              onClick={() => submitDecision("changes_requested")}
            >
              {t.review.requestChanges}
            </Button>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <p className="eyebrow">{t.review.commentsTitle}</p>

        {data.comments.length === 0 ? (
          <p className="text-sm text-muted">{t.review.noComments}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {data.comments.map((comment) => (
              <li key={comment.id} className="border-b border-border pb-4 last:border-none">
                <p className="text-sm font-medium">
                  {comment.author_name}
                  {comment.timecode_ms != null ? (
                    <span className="tabular ml-2 text-xs text-muted">
                      {formatTimecode(comment.timecode_ms)}
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-muted">{comment.body}</p>
              </li>
            ))}
          </ul>
        )}

        {data.allowComments ? (
          <form onSubmit={submitComment} className="flex flex-col gap-3">
            <textarea
              className={cn(
                "min-h-24 border border-border bg-background p-3 text-sm outline-none",
                "focus-visible:border-ink",
              )}
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder={t.review.commentPlaceholder}
            />
            <Button
              type="submit"
              variant="outline"
              className="self-start"
              disabled={sendingComment || !commentBody.trim() || !name.trim()}
            >
              {sendingComment ? t.review.sending : t.review.send}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted">{t.review.commentsDisabled}</p>
        )}
      </section>
    </div>
  );
}
