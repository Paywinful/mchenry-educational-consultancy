import ClientLayout from "@/components/ClientLayout";

export default function MainSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
