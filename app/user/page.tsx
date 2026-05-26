import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import ProfileForm from './profileForm'
import { authOptions } from '@lib/auth/authOptions'
import { getUserById } from '@actions/customer.actions'
import constructMetadata from '@components/common/SEO/SEO'

export const metadata = constructMetadata({
  title: 'User Profile',
  description:
    'Manage your personal information and account settings at Curly Pottery. Update your profile to ensure a personalized and secure shopping experience.',
})
export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  const user = await getUserById(session.user.id)

  if (!user.data) {
    redirect('/auth/login')
  }

  return <ProfileForm user={user.data} />
}
