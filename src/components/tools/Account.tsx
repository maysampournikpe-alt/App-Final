"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Copy, Download, Printer } from "lucide-react";
import { deleteAccount, recoverAccount, signIn, signOut, signUp, type AuthResult } from "@/app/actions/auth";
import { refreshAccount, useAccount } from "@/lib/account";
import { checkPassword, checkUsername, type AuthErrorCode } from "@/lib/auth/rules";
import { useLang, useT, type Key } from "@/lib/i18n";
import { usePrefs } from "@/lib/prefs";
import { buttonClass, Field, inputClass, Page } from "../ui";
import { InterestPicker } from "./Profile";

type View = "create" | "signin" | "recover";
type Step = { kind: "form" } | { kind: "code"; code: string } | { kind: "interests" };

export function AccountTool() {
  const t = useT();
  const account = useAccount();
  const [view, setView] = useState<View>("create");
  const [step, setStep] = useState<Step>({ kind: "form" });

  let body: React.ReactNode;
  if (account.status === "loading") body = <p>{t("working")}</p>;
  else if (account.status === "unavailable") body = <p className="guide-card p-5">{t("unavailable")}</p>;
  else if (step.kind === "code") body = <RecoveryStep code={step.code} onDone={() => setStep({ kind: "interests" })} />;
  else if (step.kind === "interests") body = <FinishInterests />;
  else if (account.status === "signed-in") body = <SignedIn username={account.profile.username} />;
  else
    body = (
      <>
        <p className="mb-6 max-w-prose text-lg">{t("acctGuestLead")}</p>
        <div role="tablist" className="mb-6 inline-flex overflow-hidden rounded-md border-[1.5px] border-ink">
          {(["create", "signin"] as const).map((v) => (
            <button key={v} role="tab" aria-selected={view === v || (v === "signin" && view === "recover")} onClick={() => setView(v)}
              className={`px-4 py-2 font-bold ${view === v || (v === "signin" && view === "recover") ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>
              {v === "create" ? t("createAccount") : t("signIn")}
            </button>
          ))}
        </div>
        {view === "create" ? <CreateForm onCode={(code) => setStep({ kind: "code", code })} /> : null}
        {view === "signin" ? <SignInForm onForgot={() => setView("recover")} /> : null}
        {view === "recover" ? <RecoverForm onCode={(code) => setStep({ kind: "code", code })} onBack={() => setView("signin")} /> : null}
      </>
    );

  return (
    <Page>
      <h1 className="mb-6 text-3xl sm:text-4xl">{t("acctTitle")}</h1>
      <div className="max-w-xl">{body}</div>
    </Page>
  );
}

function useErrorText() {
  const t = useT();
  return (code: AuthErrorCode | null) => (code ? t(`err_${code}` as Key) : null);
}

function PasswordInput(props: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; describedBy?: string; invalid?: boolean }) {
  const t = useT();
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <input id={props.id} type={shown ? "text" : "password"} value={props.value} onChange={(e) => props.onChange(e.target.value)}
        autoComplete={props.autoComplete} aria-describedby={props.describedBy} aria-invalid={props.invalid}
        className={`${inputClass} pr-20`} />
      <button type="button" onClick={() => setShown((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-sm font-bold text-teal underline underline-offset-2">
        {shown ? t("hide") : t("show")}
      </button>
    </div>
  );
}

function CreateForm({ onCode }: { onCode: (code: string) => void }) {
  const t = useT();
  const lang = useLang();
  const errText = useErrorText();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const [serverError, setServerError] = useState<AuthErrorCode | null>(null);
  const [pending, start] = useTransition();

  const uErr = username ? checkUsername(username) : null;
  const pErr = password ? checkPassword(password, username) : null;
  const ready = username && password && !uErr && !pErr;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!ready) return;
    setServerError(null);
    start(async () => {
      const res = await signUp({ username, password, grade, lang });
      if (res.ok && res.recoveryCode) { await refreshAccount(); onCode(res.recoveryCode); }
      else if (!res.ok) setServerError(res.error);
    });
  };
  const usernameError = errText(uErr ?? (serverError?.startsWith("username") ? serverError : null) as AuthErrorCode | null);
  const passwordError = errText(pErr ?? (serverError && !serverError.startsWith("username") ? serverError : null) as AuthErrorCode | null);

  return (
    <form onSubmit={submit} noValidate>
      <Field label={t("username")} help={t("usernameHelp")} error={usernameError}>
        {(p) => <input {...p} value={username} onChange={(e) => { setUsername(e.target.value); setServerError(null); }} autoComplete="username" autoCapitalize="none" spellCheck={false} className={inputClass} />}
      </Field>
      <Field label={t("password")} help={t("passwordHelp")} error={touched || password ? passwordError : null}>
        {(p) => <PasswordInput id={p.id} value={password} onChange={setPassword} autoComplete="new-password" describedBy={p["aria-describedby"]} invalid={p["aria-invalid"]} />}
      </Field>
      <Field label={t("gradeLabel")}>
        {(p) => (
          <select id={p.id} value={grade ?? ""} onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : null)} className={inputClass}>
            <option value="">{t("gradeNone")}</option>
            {[5, 6, 7, 8, 9, 10, 11, 12].map((g) => <option key={g} value={g}>{t("gradeN")} {g}</option>)}
          </select>
        )}
      </Field>
      <p className="mb-5 text-sm text-muted">{t("noEmailNote")}</p>
      <button disabled={pending} className={buttonClass.primary}>{pending ? t("working") : t("createAccount")}</button>
    </form>
  );
}

function SignInForm({ onForgot }: { onForgot: () => void }) {
  const t = useT();
  const errText = useErrorText();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<AuthErrorCode | null>(null);
  const [pending, start] = useTransition();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res: AuthResult = await signIn({ username, password });
      if (res.ok) { await refreshAccount(); router.push("/"); } else setError(res.error);
    });
  };
  return (
    <form onSubmit={submit}>
      <Field label={t("username")}>
        {(p) => <input {...p} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} className={inputClass} />}
      </Field>
      <Field label={t("password")} error={errText(error)}>
        {(p) => <PasswordInput id={p.id} value={password} onChange={setPassword} autoComplete="current-password" describedBy={p["aria-describedby"]} invalid={p["aria-invalid"]} />}
      </Field>
      <div className="flex flex-wrap items-center gap-4">
        <button disabled={pending || !username || !password} className={buttonClass.primary}>{pending ? t("working") : t("signIn")}</button>
        <button type="button" onClick={onForgot} className="font-bold text-teal underline underline-offset-4">{t("forgot")}</button>
      </div>
    </form>
  );
}

function RecoverForm({ onCode, onBack }: { onCode: (code: string) => void; onBack: () => void }) {
  const t = useT();
  const errText = useErrorText();
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<AuthErrorCode | null>(null);
  const [pending, start] = useTransition();
  const pErr = password ? checkPassword(password, username) : null;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pErr) return;
    setError(null);
    start(async () => {
      const res = await recoverAccount({ username, code, newPassword: password });
      if (res.ok && res.recoveryCode) { await refreshAccount(); onCode(res.recoveryCode); } else if (!res.ok) setError(res.error);
    });
  };
  return (
    <form onSubmit={submit}>
      <h2 className="mb-4 text-2xl">{t("recoverTitle")}</h2>
      <Field label={t("username")}>{(p) => <input {...p} value={username} onChange={(e) => setUsername(e.target.value)} autoCapitalize="none" spellCheck={false} className={inputClass} />}</Field>
      <Field label={t("recoveryCode")} help="XXXX-XXXX-XXXX-XXXX" error={error === "bad_recovery" || error === "rate_limited" ? errText(error) : null}>
        {(p) => <input {...p} value={code} onChange={(e) => setCode(e.target.value)} autoCapitalize="characters" spellCheck={false} className={`${inputClass} font-mono tracking-wider`} />}
      </Field>
      <Field label={t("newPassword")} error={errText(pErr ?? (error && error !== "bad_recovery" && error !== "rate_limited" ? error : null))}>
        {(p) => <PasswordInput id={p.id} value={password} onChange={setPassword} autoComplete="new-password" describedBy={p["aria-describedby"]} invalid={p["aria-invalid"]} />}
      </Field>
      <div className="flex flex-wrap items-center gap-4">
        <button disabled={pending || !username || !code || !password || !!pErr} className={buttonClass.primary}>{pending ? t("working") : t("recoverGo")}</button>
        <button type="button" onClick={onBack} className="font-bold text-teal underline underline-offset-4">{t("backToSignIn")}</button>
      </div>
    </form>
  );
}

function RecoveryStep({ code, onDone }: { code: string; onDone: () => void }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); } catch { /* clipboard blocked: the code is on screen */ }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([`Rumbo recovery code\n${code}\n`], { type: "text/plain" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "rumbo-recovery-code.txt" });
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl">{t("recoveryTitle")}</h2>
      <p className="mt-2 max-w-prose text-lg">{t("recoveryLead")}</p>
      <div className="notebook my-6 py-6 pr-4">
        <p className="select-all font-mono text-2xl font-bold tracking-widest sm:text-3xl" aria-label={code.split("").join(" ")}>{code}</p>
      </div>
      <div className="no-print flex flex-wrap gap-3">
        <button onClick={copy} className={buttonClass.quiet}>{copied ? <Check size={18} /> : <Copy size={18} />}{copied ? t("copied") : t("copy")}</button>
        <button onClick={download} className={buttonClass.quiet}><Download size={18} />{t("download")}</button>
        <button onClick={() => window.print()} className={buttonClass.quiet}><Printer size={18} />{t("print")}</button>
      </div>
      <label className="no-print mt-6 flex cursor-pointer items-start gap-3 font-bold">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-1 h-5 w-5 accent-[var(--c-teal)]" />
        {t("recoverySaved")}
      </label>
      <button disabled={!saved} onClick={onDone} className={`${buttonClass.primary} no-print mt-5`}>{t("continue")}</button>
    </div>
  );
}

function FinishInterests() {
  const router = useRouter();
  return <InterestPicker onDone={() => router.push("/")} allowSkip />;
}

function SignedIn({ username }: { username: string }) {
  const t = useT();
  const prefs = usePrefs();
  const router = useRouter();
  const errText = useErrorText();
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<AuthErrorCode | null>(null);
  const [pending, start] = useTransition();

  const exportData = () => {
    const data: Record<string, unknown> = { username, prefs, exportedAt: new Date().toISOString() };
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("rumbo:data:")) { try { data[k.slice(11)] = JSON.parse(localStorage.getItem(k) ?? "null")?.v; } catch { /* skip */ } }
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    Object.assign(document.createElement("a"), { href: url, download: "rumbo-my-data.json" }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <p className="text-lg">{t("signedInAs")} <b className="font-mono">{username}</b></p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => start(async () => { await signOut(); await refreshAccount(); router.push("/"); })} disabled={pending} className={buttonClass.secondary}>{t("signOut")}</button>
        <button onClick={exportData} className={buttonClass.quiet}><Download size={18} />{t("downloadData")}</button>
      </div>
      <div className="mt-10 border-t-2 border-dotted border-line pt-6">
        {!deleting ? (
          <button onClick={() => setDeleting(true)} className={buttonClass.danger}>{t("deleteAccount")}</button>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setError(null); start(async () => { const r = await deleteAccount({ password }); if (r.ok) { await refreshAccount(); router.push("/"); } else setError(r.error); }); }}>
            <p className="mb-4 font-bold text-ruby">{t("deleteWarn")}</p>
            <Field label={t("deleteConfirm")} error={errText(error)}>
              {(p) => <PasswordInput id={p.id} value={password} onChange={setPassword} autoComplete="current-password" describedBy={p["aria-describedby"]} invalid={p["aria-invalid"]} />}
            </Field>
            <div className="flex gap-3">
              <button disabled={pending || !password} className={buttonClass.primary}>{t("deleteGo")}</button>
              <button type="button" onClick={() => { setDeleting(false); setPassword(""); setError(null); }} className={buttonClass.quiet}>{t("cancel")}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
