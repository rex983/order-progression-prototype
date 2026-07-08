"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { RotateCcw, Save } from "lucide-react";
import {
  resetEmailTemplate,
  saveEmailTemplate,
} from "@/app/actions";
import { renderTemplate } from "@/lib/emails";
import type { EmailTemplate, EmailToType, Order } from "@/lib/types";
import { EMAIL_TOKENS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Field = "subject" | "body" | "toCustom" | "cc" | "bcc";

export function EmailTemplateEditor({
  template,
  sampleOrders,
}: {
  template: EmailTemplate;
  sampleOrders: Order[];
}) {
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [toType, setToType] = useState<EmailToType>(template.toType);
  const [toCustom, setToCustom] = useState(template.toCustom);
  const [cc, setCc] = useState(template.cc);
  const [bcc, setBcc] = useState(template.bcc);
  const [enabled, setEnabled] = useState(template.enabled);
  const [sampleId, setSampleId] = useState(sampleOrders[0]?.id ?? "");
  const [focusField, setFocusField] = useState<Field>("body");
  const [saving, startSaving] = useTransition();
  const [resetting, startReset] = useTransition();

  const refs: Record<Field, React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>> = {
    subject: useRef<HTMLInputElement>(null),
    body: useRef<HTMLTextAreaElement>(null),
    toCustom: useRef<HTMLInputElement>(null),
    cc: useRef<HTMLInputElement>(null),
    bcc: useRef<HTMLInputElement>(null),
  };

  const setters: Record<Field, (v: string) => void> = {
    subject: setSubject,
    body: setBody,
    toCustom: setToCustom,
    cc: setCc,
    bcc: setBcc,
  };

  const values: Record<Field, string> = {
    subject,
    body,
    toCustom,
    cc,
    bcc,
  };

  const sample = useMemo(
    () => sampleOrders.find((o) => o.id === sampleId) ?? sampleOrders[0],
    [sampleId, sampleOrders],
  );

  const preview = useMemo(() => {
    if (!sample) return null;
    return renderTemplate(
      {
        ...template,
        subject,
        body,
        toType,
        toCustom,
        cc,
        bcc,
        enabled,
      },
      sample,
    );
  }, [template, subject, body, toType, toCustom, cc, bcc, enabled, sample]);

  function insertToken(token: string) {
    const el = refs[focusField].current;
    const setter = setters[focusField];
    const current = values[focusField];
    if (!el) {
      setter(current + token);
      return;
    }
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const next = current.slice(0, start) + token + current.slice(end);
    setter(next);
    // Restore caret after React re-renders.
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function handleSave() {
    startSaving(async () => {
      try {
        await saveEmailTemplate({
          key: template.key,
          subject,
          body,
          toType,
          toCustom,
          cc,
          bcc,
          enabled,
        });
        toast.success("Template saved");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  function handleReset() {
    if (!confirm("Reset this template to the default? Your edits will be lost.")) return;
    startReset(async () => {
      try {
        await resetEmailTemplate({ key: template.key });
        toast.success("Template reset to default — reload to see it");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Reset failed");
      }
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <Card className="bg-card/40">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Editor</CardTitle>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-3.5 w-3.5"
              />
              <span>Enabled (fires on stage change)</span>
            </label>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
              <div>
                <Label className="text-xs">Send to</Label>
                <Select value={toType} onValueChange={(v) => setToType(v as EmailToType)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="custom">Custom address(es)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {toType === "custom" && (
                <div>
                  <Label className="text-xs">To address(es)</Label>
                  <Input
                    ref={refs.toCustom as React.RefObject<HTMLInputElement>}
                    value={toCustom}
                    onChange={(e) => setToCustom(e.target.value)}
                    onFocus={() => setFocusField("toCustom")}
                    placeholder="ops@bbd.com, {{customerEmail}}"
                    className="mt-1.5"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">CC</Label>
                <Input
                  ref={refs.cc as React.RefObject<HTMLInputElement>}
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  onFocus={() => setFocusField("cc")}
                  placeholder="Optional — comma-separated"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs">BCC</Label>
                <Input
                  ref={refs.bcc as React.RefObject<HTMLInputElement>}
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  onFocus={() => setFocusField("bcc")}
                  placeholder="Optional — comma-separated"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Subject</Label>
              <Input
                ref={refs.subject as React.RefObject<HTMLInputElement>}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onFocus={() => setFocusField("subject")}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-xs">Body</Label>
              <Textarea
                ref={refs.body as React.RefObject<HTMLTextAreaElement>}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onFocus={() => setFocusField("body")}
                rows={22}
                className="mt-1.5 font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={resetting || saving}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset to default
              </Button>
              <Button onClick={handleSave} disabled={saving || resetting}>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {preview && sample && (
          <Card className="bg-card/40">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm">Preview</CardTitle>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Sample order</Label>
                <Select value={sampleId} onValueChange={setSampleId}>
                  <SelectTrigger className="h-8 min-w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleOrders.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        #{o.orderNumber} · {o.customerName.split(" ")[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="rounded-md border bg-muted/30 p-3 space-y-1 text-xs">
                <div>
                  <span className="text-muted-foreground">To:</span>{" "}
                  {preview.to || <span className="italic text-muted-foreground">(empty)</span>}
                </div>
                {preview.cc && (
                  <div>
                    <span className="text-muted-foreground">CC:</span> {preview.cc}
                  </div>
                )}
                {preview.bcc && (
                  <div>
                    <span className="text-muted-foreground">BCC:</span> {preview.bcc}
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Subject:</span>{" "}
                  <span className="font-semibold">{preview.subject}</span>
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto rounded-md border bg-muted/30 p-4">
                <pre className="whitespace-pre-wrap text-xs font-sans leading-relaxed">
                  {preview.body}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <Card className="bg-card/40 lg:sticky lg:top-4">
          <CardHeader>
            <CardTitle className="text-sm">Insert token</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-[11px] text-muted-foreground">
              Click a token to insert it at the cursor in the last field you focused.
              <span className="block mt-1">
                Active field: <Badge variant="outline" className="ml-1">{focusField}</Badge>
              </span>
            </p>
            <div className="space-y-1">
              {EMAIL_TOKENS.map((t) => (
                <button
                  key={t.token}
                  type="button"
                  onClick={() => insertToken(t.token)}
                  className="w-full text-left rounded-md border bg-background/40 px-2.5 py-1.5 hover:bg-accent/40 transition"
                >
                  <div className="font-mono text-[11px]">{t.token}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {t.label}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
