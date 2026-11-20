import { AdminPageWrapper } from '../../../components/admin-page-wrapper'
import { AdminHousingHostDetailContent } from '../../components/admin-housing-host-detail-content'

export default async function AdminHousingHostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <AdminPageWrapper
      hub="housing"
      title="Host detail"
      description="Listings and recent application decisions for this host."
      showComplianceStrip
      compliancePurpose="support"
    >
      <AdminHousingHostDetailContent hostId={id} />
    </AdminPageWrapper>
  )
}
