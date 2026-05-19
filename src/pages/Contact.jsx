import ComingSoon from '@/components/ComingSoon'
import { COMPANY } from '@/config'

export default function Contact() {
  return (
    <ComingSoon
      title="Contact Us"
      subtitle={`Get in touch any time at ${COMPANY.contactEmail}. Full contact form coming soon.`}
    />
  )
}
