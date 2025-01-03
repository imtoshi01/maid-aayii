import ServiceProviderDetails from '../../components/ServiceProviderDetails'

export default function ServiceProviderPage({ params }: { params: { id: string } }) {
  return <ServiceProviderDetails id={params.id} />
}

