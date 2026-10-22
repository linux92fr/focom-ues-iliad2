import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import AssistantIAPage from "@/components/admin/AssistantIAPage";

export default function AdminAssistantIA() {
  return <AdminAuthGuard><AdminLayout title="Assistant IA" breadcrumb={["Administration", "Assistant IA"]}><AssistantIAPage /></AdminLayout></AdminAuthGuard>;
}
