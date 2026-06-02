import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Trash2, Clock, MessageCircle, FileDown, Newspaper } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  item_type: "tract" | "article";
  item_id: string;
  author_name: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

function CommentCard({ comment, onAction }: { comment: Comment; onAction: (id: string, action: "approved" | "rejected" | "delete") => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0">
            {comment.author_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{comment.author_name}</p>
            <p className="text-[11px] text-slate-400">{relativeDate(comment.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="outline" className="text-[10px] gap-1">
            {comment.item_type === "tract"
              ? <><FileDown className="w-2.5 h-2.5" /> Tract</>
              : <><Newspaper className="w-2.5 h-2.5" /> Article</>
            }
          </Badge>
          {comment.status === "pending" && <Badge className="bg-amber-100 text-amber-700 text-[10px]"><Clock className="w-2.5 h-2.5 mr-1" />En attente</Badge>}
          {comment.status === "approved" && <Badge className="bg-green-100 text-green-700 text-[10px]"><CheckCircle2 className="w-2.5 h-2.5 mr-1" />Approuvé</Badge>}
          {comment.status === "rejected" && <Badge className="bg-red-100 text-red-700 text-[10px]"><XCircle className="w-2.5 h-2.5 mr-1" />Rejeté</Badge>}
        </div>
      </div>

      <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">{comment.content}</p>

      <div className="flex gap-2">
        {comment.status !== "approved" && (
          <Button size="sm" onClick={() => onAction(comment.id, "approved")}
            className="bg-green-600 hover:bg-green-700 text-white gap-1.5 h-8 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approuver
          </Button>
        )}
        {comment.status !== "rejected" && (
          <Button size="sm" variant="outline" onClick={() => onAction(comment.id, "rejected")}
            className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5 h-8 text-xs">
            <XCircle className="w-3.5 h-3.5" /> Rejeter
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => onAction(comment.id, "delete")}
          className="text-slate-400 hover:text-red-600 hover:bg-red-50 gap-1.5 h-8 text-xs ml-auto">
          <Trash2 className="w-3.5 h-3.5" /> Supprimer
        </Button>
      </div>
    </div>
  );
}

export default function AdminModerationCommentaires() {
  const [tab, setTab] = useState("pending");
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["admin-comments", tab],
    queryFn: async () => {
      const query = supabase
        .from("fil_comments")
        .select("id, item_type, item_id, author_name, content, status, created_at")
        .order("created_at", { ascending: false });
      if (tab !== "all") query.eq("status", tab);
      const { data } = await query;
      return (data ?? []) as Comment[];
    },
  });

  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["admin-comments-pending-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("fil_comments")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      return count ?? 0;
    },
    refetchInterval: 30000,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "approved" | "rejected" | "delete" }) => {
      if (action === "delete") {
        await supabase.from("fil_comments").delete().eq("id", id);
      } else {
        await supabase.from("fil_comments").update({ status: action }).eq("id", id);
      }
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-comments-pending-count"] });
      if (action === "approved") toast.success("Commentaire approuvé");
      else if (action === "rejected") toast.warning("Commentaire rejeté");
      else toast.success("Commentaire supprimé");
    },
  });

  const handleAction = (id: string, action: "approved" | "rejected" | "delete") => {
    actionMutation.mutate({ id, action });
  };

  return (
    <AdminAuthGuard>
      <AdminLayout title="Modération commentaires" breadcrumb={["Administration", "Modération"]}>
        <div className="max-w-3xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Commentaires du fil</h2>
              <p className="text-sm text-slate-500">
                {pendingCount > 0
                  ? <span className="text-amber-600 font-semibold">{pendingCount} commentaire{pendingCount > 1 ? "s" : ""} en attente de modération</span>
                  : "Aucun commentaire en attente"}
              </p>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="pending" className="gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5" /> En attente
                {pendingCount > 0 && <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{pendingCount}</span>}
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-1.5 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approuvés
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-1.5 text-xs">
                <XCircle className="w-3.5 h-3.5" /> Rejetés
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs">Tous</TabsTrigger>
            </TabsList>

            {["pending", "approved", "rejected", "all"].map((t) => (
              <TabsContent key={t} value={t} className="mt-4 space-y-3">
                {isLoading ? (
                  <div className="py-12 text-center text-slate-400 text-sm">Chargement…</div>
                ) : comments.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucun commentaire {t === "pending" ? "en attente" : t === "approved" ? "approuvé" : t === "rejected" ? "rejeté" : ""}</p>
                  </div>
                ) : (
                  comments.map((c) => (
                    <CommentCard key={c.id} comment={c} onAction={handleAction} />
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
