"use client";

import { useI18n } from "@llm-space/ui/i18n";
import { Button } from "@llm-space/ui/ui/button";
import { Separator } from "@llm-space/ui/ui/separator";
import { Loader2Icon, LogOut } from "lucide-react";

import { useGithubAuth } from "@/components/github-auth-provider";
import { GithubAvatar } from "@/components/github-avatar";
import { GitHubIcon } from "@/components/github-icon";

import { SettingsPage } from "./settings-page";

export function AccountPage() {
  const { state, signIn, signOut } = useGithubAuth();
  const { t } = useI18n();

  return (
    <SettingsPage
      title={t.settings.account.title}
      description={t.settings.account.description}
      className="overflow-y-auto"
    >
      <div className="flex flex-col gap-6 pb-2">
        {state.status === "signedIn" ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <GithubAvatar user={state.user} className="size-10" />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {state.user.name ?? state.user.login}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  @{state.user.login}
                  {state.user.email ? ` · ${state.user.email}` : ""}
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut />
              {t.settings.account.signOut}
            </Button>
          </div>
        ) : state.status === "signingIn" ? (
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2Icon className="size-4 animate-spin" />
              {t.settings.account.signingIn}
            </span>
            <Button variant="outline" onClick={signOut}>
              {t.settings.account.cancel}
            </Button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <span className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {t.settings.account.notSignedIn}
              </span>
              <span className="text-muted-foreground text-xs">
                {t.settings.account.notSignedInDescription}
              </span>
            </span>
            <Button onClick={signIn}>
              <GitHubIcon />
              {t.settings.account.signInWithGithub}
            </Button>
          </div>
        )}

        <Separator />

        <p className="text-muted-foreground text-xs leading-relaxed">
          {t.settings.account.gistDescription}
        </p>
      </div>
    </SettingsPage>
  );
}
