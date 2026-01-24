import { Container, Text } from '@components/ui'
import RegisterForm from '../../../components/auth/RegisterForm'
import constructMetadata from '@components/common/SEO'

export const metadata = constructMetadata({
  title: 'Register',
  description:
    'Create a new Curly Pottery account to start managing your orders, track shipments, and access exclusive member benefits. Enjoy a seamless shopping experience with us.',
})

export default function RegisterPage() {
  return (
    <Container className="p-10">
      <header className="justify-center text-center mx-auto mb-4">
        <Text variant="heading">Create Account</Text>
        <Text variant="subHeading">
          Join us for a faster checkout experience
        </Text>
      </header>

      <RegisterForm />
    </Container>
  )
}
