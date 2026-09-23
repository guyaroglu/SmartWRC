import type { AuthUser } from "@/lib/authz";
import { loadAttentionBundle } from "@/lib/attention-load";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";

export {
  Badge,
  Card,
  DeploymentBadge,
  EmptyState,
  FeedbackAlert,
  Field,
  GateBadge,
  GateHeadline,
  GhostButton,
  LockedBanner,
  OwnerChip,
  PageHeader,
  PrimaryButton,
  PriorityBadge,
  ProgressBar,
  SecondaryButton,
  SectionTitle,
  SelectInput,
  StatusBadge,
  TeamBadge,
  TextArea,
  TextInput,
} from "@/components/ui";

export async function Shell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AuthUser & { name: string; email: string };
}) {
  const { items, reviewCount } = await loadAttentionBundle(user);
  return (
    <div className="min-h-screen bg-sand-100 p-0 md:p-5">
      <div className="mx-auto flex min-h-screen max-w-shell overflow-hidden bg-white md:min-h-[calc(100vh-40px)] md:rounded-shell md:shadow-raised">
        <Sidebar role={user.role} reviewCount={reviewCount} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar name={user.name} role={user.role} teamKey={user.teamKey ?? null} attention={items} />
          <main className="flex-1 overflow-auto bg-sand-50 px-5 py-6 md:px-7">
            <div className="mx-auto flex max-w-content flex-col gap-5">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
