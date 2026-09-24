import type { AuthUser } from "@/lib/authz";
import { loadAttentionBundle } from "@/lib/attention-load";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";

export {
  Avatar,
  Badge,
  buttonClass,
  Card,
  DangerButton,
  DeploymentBadge,
  EmptyState,
  Eyebrow,
  FeedbackAlert,
  Field,
  GateBadge,
  GateHeadline,
  GhostButton,
  GroupHeading,
  LockedBanner,
  OwnerChip,
  PageHeader,
  PrimaryButton,
  PriorityBadge,
  ProgressBar,
  SecondaryButton,
  SectionTitle,
  Segmented,
  SelectInput,
  StatusBadge,
  TeamBadge,
  TextArea,
  TextInput,
} from "@/components/ui";

// Prototype shell: 20px sand-100 frame → 1400px white shell, 28px radius, shadow-raised,
// min-height 900 → 184px sidebar | 64px top bar over sand-50 canvas (24/28/40 padding),
// content column capped at 1180px with a 20px vertical rhythm.
export async function Shell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AuthUser & { name: string; email: string };
}) {
  const { items, reviewCount } = await loadAttentionBundle(user);
  return (
    <div className="min-h-screen bg-sand-100 md:p-5">
      <div className="mx-auto flex min-h-screen max-w-shell overflow-hidden bg-white md:min-h-shell md:rounded-shell md:shadow-raised">
        <Sidebar role={user.role} reviewCount={reviewCount} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar name={user.name} role={user.role} teamKey={user.teamKey ?? null} attention={items} />
          <main className="flex-1 overflow-auto bg-sand-50 px-4 pb-10 pt-6 md:px-7">
            <div className="mx-auto flex max-w-content flex-col gap-5">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
