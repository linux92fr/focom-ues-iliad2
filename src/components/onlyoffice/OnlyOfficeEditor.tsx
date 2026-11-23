import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    DocsAPI?: {
      DocEditor: new (
        elementId: string,
        config: Record<string, unknown>,
      ) => {
        destroyEditor?: () => void;
      };
    };
  }
}

interface OnlyOfficeEditorProps {
  documentId: string;
  title: string;
  mode?: "edit" | "view";
  onClose: () => void;
}

const DOCUMENT_SERVER_URL = (
  import.meta.env.VITE_ONLYOFFICE_DOCUMENT_SERVER_URL ||
  "https://docs.focomues-iliad.fr"
).replace(/\/+$/, "");
const ONLYOFFICE_API_URL = (
  import.meta.env.VITE_ONLYOFFICE_API_URL ||
  "/api"
).replace(/\/+$/, "");

let scriptPromise: Promise<void> | null = null;

function loadOnlyOfficeApi() {
  if (window.DocsAPI) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${DOCUMENT_SERVER_URL}/web-apps/apps/api/documents/api.js`;
    script.async = true;
    script.dataset.onlyofficeDocsApi = "true";
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Impossible de charger l’API ONLYOFFICE."));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export default function OnlyOfficeEditor({
  documentId,
  title,
  mode = "edit",
  onClose,
}: OnlyOfficeEditorProps) {
  const reactId = useId();
  const editorElementId = `onlyoffice-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const editorRef = useRef<{ destroyEditor?: () => void } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const openEditor = async () => {
      setLoading(true);
      setError("");

      try {
        await loadOnlyOfficeApi();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error("Session administrateur expirée.");

        const response = await fetch(`${ONLYOFFICE_API_URL}/onlyoffice/config`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${session.access_token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ documentId, mode }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.config) {
          throw new Error(payload.error || "Configuration ONLYOFFICE indisponible.");
        }

        if (!active || !window.DocsAPI) return;
        const config = {
          ...payload.config,
          events: {
            onDocumentReady: () => setLoading(false),
            onError: () => {
              setError("ONLYOFFICE n’a pas pu ouvrir ce document.");
              setLoading(false);
            },
          },
        };
        editorRef.current = new window.DocsAPI.DocEditor(editorElementId, config);
      } catch (openError) {
        if (!active) return;
        setError(
          openError instanceof Error
            ? openError.message
            : "Impossible d’ouvrir l’éditeur.",
        );
        setLoading(false);
      }
    };

    void openEditor();
    return () => {
      active = false;
      editorRef.current?.destroyEditor?.();
      editorRef.current = null;
    };
  }, [documentId, editorElementId, mode]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-slate-950/90 p-2 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Éditeur ONLYOFFICE : ${title}`}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-teal-600">
              Édition ONLYOFFICE
            </p>
            <h2 className="truncate text-sm font-extrabold text-slate-900 sm:text-base">
              {title}
            </h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="shrink-0 gap-2"
          >
            <X className="h-4 w-4" />
            Fermer
          </Button>
        </header>

        <div className="relative min-h-0 flex-1">
          <div id={editorElementId} className="h-full min-h-[480px] w-full" />
          {loading && (
            <div className="absolute inset-0 grid place-items-center bg-slate-50">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
                Préparation de l’éditeur…
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 grid place-items-center bg-slate-50 p-6">
              <div className="max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
                <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
                <p className="mt-3 font-extrabold text-slate-900">
                  Éditeur indisponible
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
