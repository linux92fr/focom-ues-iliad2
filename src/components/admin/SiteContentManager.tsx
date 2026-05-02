import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { defaultSiteContent, type SiteContentKey } from "@/lib/siteContent";
import { Save } from "lucide-react";
import { toast } from "sonner";

const labels: Record<SiteContentKey, string> = {
  bilan_mandat: "Bilan de mandat",
  espace_adherent: "Espace adherent",
  combats: "Nos combats / Vos droits",
  contact_strip: "Bandeau contact",
};

const keys = Object.keys(defaultSiteContent) as SiteContentKey[];

const SiteContentManager = () => {
  const [activeKey, setActiveKey] = useState<SiteContentKey>("bilan_mandat");
  const [tableMissing, setTableMissing] = useState(false);
  const [forms, setForms] = useState(() =>
    Object.fromEntries(
      keys.map((key) => [
        key,
        {
          title: defaultSiteContent[key].title,
          subtitle: defaultSiteContent[key].subtitle,
          content: JSON.stringify(defaultSiteContent[key].content, null, 2),
        },
      ])
    ) as Record<SiteContentKey, { title: string; subtitle: string; content: string }>
  );

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("key, title, subtitle, content")
        .in("key", keys);

      if (error) {
        if (error.message?.includes("site_content") || error.code === "PGRST205") {
          setTableMissing(true);
        }
        return;
      }

      if (!data) return;

      setForms((current) => {
        const next = { ...current };
        data.forEach((row: { key: string; title: string; subtitle: string; content: unknown }) => {
          if (!keys.includes(row.key)) return;
          next[row.key as SiteContentKey] = {
            title: row.title || defaultSiteContent[row.key as SiteContentKey].title,
            subtitle: row.subtitle || defaultSiteContent[row.key as SiteContentKey].subtitle,
            content: JSON.stringify(row.content || defaultSiteContent[row.key as SiteContentKey].content, null, 2),
          };
        });
        return next;
      });
    };

    fetchContent();
  }, []);

  const updateForm = (field: "title" | "subtitle" | "content", value: string) => {
    setForms((current) => ({
      ...current,
      [activeKey]: {
        ...current[activeKey],
        [field]: value,
      },
    }));
  };

  const save = async () => {
    const form = forms[activeKey];

    if (tableMissing) {
      toast.error("La table site_content n'existe pas encore dans Supabase");
      return;
    }

    let content: unknown;

    try {
      content = JSON.parse(form.content);
    } catch {
      toast.error("Le contenu JSON n'est pas valide");
      return;
    }

    const { error } = await supabase.from("site_content").upsert(
      {
        key: activeKey,
        title: form.title,
        subtitle: form.subtitle,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) {
      if (error.message?.includes("site_content") || error.code === "PGRST205") {
        setTableMissing(true);
      }
      toast.error(error.message || "Impossible d'enregistrer ce contenu");
      return;
    }

    toast.success("Contenu mis a jour");
  };

  const form = forms[activeKey];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contenus du site</CardTitle>
        <CardDescription>
          Modifiez les blocs affiches sur la page d'accueil sans intervenir dans le code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tableMissing && (
          <div className="mb-5 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
            <p className="font-semibold text-primary">Configuration Supabase requise</p>
            <p className="mt-1 text-muted-foreground">
              La table <span className="font-mono">site_content</span> n'existe pas encore.
              Executez la migration <span className="font-mono">20260430153000_create_site_content.sql</span> dans Supabase,
              puis rechargez cette page.
            </p>
          </div>
        )}
        <Tabs value={activeKey} onValueChange={(value) => setActiveKey(value as SiteContentKey)}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            {keys.map((key) => (
              <TabsTrigger key={key} value={key}>
                {labels[key]}
              </TabsTrigger>
            ))}
          </TabsList>

          {keys.map((key) => (
            <TabsContent key={key} value={key} className="space-y-5 pt-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`${key}-title`}>Titre</Label>
                  <Input
                    id={`${key}-title`}
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${key}-subtitle`}>Sous-titre</Label>
                  <Input
                    id={`${key}-subtitle`}
                    value={form.subtitle}
                    onChange={(event) => updateForm("subtitle", event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${key}-content`}>Contenu structure</Label>
                <Textarea
                  id={`${key}-content`}
                  value={form.content}
                  onChange={(event) => updateForm("content", event.target.value)}
                  className="min-h-[360px] font-mono text-xs"
                  spellCheck={false}
                />
                <p className="text-xs text-muted-foreground">
                  Conservez une structure JSON valide. Les listes peuvent etre modifiees, ajoutees ou supprimees.
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={save} className="gap-2">
                  <Save className="h-4 w-4" />
                  Enregistrer
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SiteContentManager;
