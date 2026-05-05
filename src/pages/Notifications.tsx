import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Bell, Check, CheckCheck, Loader2, Search, Filter,
  ChevronLeft, ChevronRight, Trash2, Archive, ArchiveRestore,
  ExternalLink, BellOff, LogIn,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  archived: boolean;
  link: string | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 15;

const typeConfig: Record<string, { label: string; className: string }> = {
  article:   { label: 'Article',   className: 'bg-blue-100 text-blue-800' },
  formation: { label: 'Formation', className: 'bg-green-100 text-green-800' },
  action:    { label: 'Action',    className: 'bg-primary/10 text-primary' },
  info:      { label: 'Info',      className: 'bg-muted text-muted-foreground' },
};

const Notifications = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [filterArchived, setFilterArchived] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; ids: string[] }>({ open: false, ids: [] });

  // ── Auth check ───────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch ────────────────────────────────────────────────────
  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, currentPage, filterType, filterRead, filterArchived, searchQuery]);

  const fetchNotifications = async () => {
    if (!user) return;
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (filterType !== 'all') query = query.eq('type', filterType);
    if (filterRead === 'read') query = query.eq('is_read', true);
    else if (filterRead === 'unread') query = query.eq('is_read', false);
    if (filterArchived === 'active') query = query.eq('archived', false);
    else if (filterArchived === 'archived') query = query.eq('archived', true);
    if (searchQuery.trim()) query = query.or(`title.ilike.%${searchQuery}%,message.ilike.%${searchQuery}%`);

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    query = query.range(from, from + ITEMS_PER_PAGE - 1);

    const { data, count, error } = await query;
    if (!error && data) {
      setNotifications(data as Notification[]);
      setTotalCount(count || 0);
      setSelectedIds(new Set());
    }
  };

  // ── Actions ──────────────────────────────────────────────────
  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const toggleArchive = async (id: string, archived: boolean) => {
    const { error } = await supabase.from('notifications').update({ archived: !archived }).eq('id', id);
    if (!error) { toast.success(archived ? 'Désarchivée' : 'Archivée'); fetchNotifications(); }
  };

  const deleteOne = async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (!error) {
      toast.success('Notification supprimée');
      setNotifications(prev => prev.filter(n => n.id !== id));
      setTotalCount(prev => prev - 1);
    }
  };

  const bulkMarkRead = async () => {
    if (!selectedIds.size) return;
    setActionLoading(true);
    await supabase.from('notifications').update({ is_read: true }).in('id', [...selectedIds]);
    toast.success(`${selectedIds.size} notification(s) marquée(s) comme lues`);
    setActionLoading(false);
    fetchNotifications();
  };

  const bulkArchive = async (archive: boolean) => {
    if (!selectedIds.size) return;
    setActionLoading(true);
    await supabase.from('notifications').update({ archived: archive }).in('id', [...selectedIds]);
    toast.success(archive ? 'Archivées' : 'Désarchivées');
    setActionLoading(false);
    fetchNotifications();
  };

  const bulkDelete = async () => {
    setActionLoading(true);
    await supabase.from('notifications').delete().in('id', [...deleteConfirm.ids]);
    toast.success(`${deleteConfirm.ids.length} notification(s) supprimée(s)`);
    setDeleteConfirm({ open: false, ids: [] });
    setActionLoading(false);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    if (!user) return;
    setActionLoading(true);
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    toast.success('Toutes les notifications ont été marquées comme lues');
    setActionLoading(false);
    fetchNotifications();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === notifications.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(notifications.map(n => n.id)));
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ── Loading ──────────────────────────────────────────────────
  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Non connecté ─────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-10 pb-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Accès réservé aux membres</h2>
            <p className="text-sm text-muted-foreground">
              Connectez-vous pour consulter vos notifications.
            </p>
            <Button onClick={() => navigate('/profil')} className="w-full gap-2">
              <LogIn className="w-4 h-4" />
              Se connecter
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Page principale ──────────────────────────────────────────
  return (
    <div className="p-4 lg:p-8">
      <main className="container mx-auto px-4 pt-8 pb-16">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Bell className="h-8 w-8 text-primary" />
                Mes notifications
              </h1>
              <p className="text-muted-foreground mt-1">
                {totalCount} notification{totalCount !== 1 ? 's' : ''}
                {unreadCount > 0 && ` • ${unreadCount} non lue${unreadCount !== 1 ? 's' : ''}`}
              </p>
            </div>
            <Button variant="outline" onClick={markAllAsRead} disabled={actionLoading || unreadCount === 0}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Tout marquer lu
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-4">
            <CardContent className="pt-5 pb-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher…"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select value={filterArchived} onValueChange={(v) => { setFilterArchived(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[130px]">
                      <Archive className="mr-2 h-4 w-4" /><SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="active">Actives</SelectItem>
                      <SelectItem value="archived">Archivées</SelectItem>
                      <SelectItem value="all">Toutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={(v) => { setFilterType(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[130px]">
                      <Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="article">Articles</SelectItem>
                      <SelectItem value="formation">Formations</SelectItem>
                      <SelectItem value="action">Actions</SelectItem>
                      <SelectItem value="info">Infos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterRead} onValueChange={(v) => { setFilterRead(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="unread">Non lues</SelectItem>
                      <SelectItem value="read">Lues</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk action bar */}
          {notifications.length > 0 && (
            <div className="flex items-center gap-3 mb-3 px-1">
              <Checkbox
                checked={selectedIds.size === notifications.length && notifications.length > 0}
                onCheckedChange={toggleSelectAll}
                aria-label="Tout sélectionner"
              />
              <span className="text-sm text-muted-foreground">
                {selectedIds.size > 0 ? `${selectedIds.size} sélectionnée(s)` : 'Tout sélectionner'}
              </span>
              {selectedIds.size > 0 && (
                <div className="flex gap-2 ml-auto flex-wrap">
                  <Button size="sm" variant="outline" onClick={bulkMarkRead} disabled={actionLoading}>
                    <Check className="h-4 w-4 mr-1" /> Marquer lues
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => bulkArchive(filterArchived !== 'archived')} disabled={actionLoading}>
                    {filterArchived === 'archived'
                      ? <><ArchiveRestore className="h-4 w-4 mr-1" />Désarchiver</>
                      : <><Archive className="h-4 w-4 mr-1" />Archiver</>}
                  </Button>
                  <Button size="sm" variant="destructive"
                    onClick={() => setDeleteConfirm({ open: true, ids: [...selectedIds] })}
                    disabled={actionLoading}>
                    <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* List */}
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-medium">Aucune notification</p>
                  <p className="text-sm text-muted-foreground mt-1">Modifiez les filtres ou revenez plus tard.</p>
                </CardContent>
              </Card>
            ) : notifications.map((notif) => (
              <Card key={notif.id}
                className={`transition-colors ${!notif.is_read ? 'border-l-4 border-l-primary bg-primary/5' : ''} ${notif.archived ? 'opacity-60' : ''}`}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedIds.has(notif.id)}
                      onCheckedChange={() => toggleSelect(notif.id)}
                      className="mt-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={typeConfig[notif.type]?.className || 'bg-muted text-muted-foreground'}>
                          {typeConfig[notif.type]?.label || notif.type}
                        </Badge>
                        {!notif.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                        {notif.archived && <Badge variant="outline" className="text-xs">Archivée</Badge>}
                      </div>
                      <p className={`font-medium text-sm ${!notif.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notif.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notif.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {notif.link && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Ouvrir">
                          <Link to={notif.link} onClick={() => !notif.is_read && markAsRead(notif.id)}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {!notif.is_read && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markAsRead(notif.id)} title="Marquer lu">
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => toggleArchive(notif.id, notif.archived)}
                        title={notif.archived ? 'Désarchiver' : 'Archiver'}>
                        {notif.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirm({ open: true, ids: [notif.id] })}
                        title="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">Page {currentPage} / {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Suivant <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete confirm */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, ids: [] })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer {deleteConfirm.ids.length > 1 ? `ces ${deleteConfirm.ids.length} notifications` : 'cette notification'} ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={bulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Notifications;