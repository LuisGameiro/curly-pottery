import { redirect } from 'next/navigation'
import ProfileForm from './profileForm'
import { auth } from '@/auth'
import { getUserById } from '@actions/customer.actions'
import constructMetadata from '@components/common/SEO/SEO'

export const metadata = constructMetadata({
  title: 'User Profile',
  description:
    'Manage your personal information and account settings at Curly Pottery. Update your profile to ensure a personalized and secure shopping experience.',
})
export default async function ProfilePage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/login')
  }

  const user = await getUserById(session.user.id)

  if (!user.data) {
    redirect('/auth/login')
  }

  return (
    <div data-testid="user-dashboard-page">
      <ProfileForm user={user.data} />
    </div>
  )
}
