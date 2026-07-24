import constructMetadata from '@components/common/SEO'
import { Container, Text } from '@components/ui'

export const metadata = constructMetadata({
  title: 'Privacy Policy',
  description:
    'Learn about Curly Pottery’s commitment to protecting your personal data and privacy. Read our comprehensive Privacy Policy to understand how we handle your information in compliance with GDPR regulations.',
  canonical: '/privacy',
})
export default function PrivacyPolicy() {
  const lastUpdated = 'May 2026'

  return (
    <Container
      className="px-4 py-6 sm:px-10 sm:py-10 bg-linear-to-r from-background to-accent-2"
      data-testid="privacy-page"
    >
      <header className="justify-center text-center mx-auto mb-10">
        <Text variant="heading">Privacy Policy</Text>
        <p className="text-sm text-muted mt-2">Last Updated: {lastUpdated}</p>
      </header>

      <section className="space-y-6 md:max-w-3xl mx-auto text-secondary">
        <Text variant="body">
          Welcome to Curly Pottery which operates this store and website,
          including all related information, content, features, tools, products
          and services, to provide you, the customer, with a curated shopping
          experience. This privacy policy will inform you about how we collect,
          use and disclose your personal information when you visit our website,
          purchase our pottery, and tell you about your privacy rights.
        </Text>

        <Text variant="body">
          Please read this notice carefully. By using and accessing any of the
          services, you acknowledge that you have read this Privacy Policy and
          understand the collection, use, and disclosure of your information as
          described in this Privacy Policy. Should you have any questions please
          get in touch via email to curly.pottery@gmail.com.
        </Text>

        <Text variant="sectionHeading" className="text-xl font-bold mt-8 mb-2">
          1. Purpose of this Privacy Policy
        </Text>
        <Text variant="body">
          This privacy policy aims to give you information on how Curly Pottery
          collects and processes your personal data through your use of this
          website, including any data you may provide when you purchase a
          product or interact with us.
        </Text>

        <Text variant="sectionHeading" className="text-xl font-bold mt-8 mb-2">
          2. The data we collect
        </Text>
        <Text variant="body">
          We may collect, use, store and transfer different kinds of personal
          data as follows:
        </Text>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Identity Data:</strong> Includes first name and last name.
          </li>
          <li>
            <strong>Contact Data:</strong> Includes billing address, delivery
            address, email address, and telephone numbers.
          </li>
          <li>
            <strong>Financial Data:</strong> Payment card details are handled
            entirely by our third-party payment processors. We do not store your
            raw financial or credit card information on our servers.
          </li>
          <li>
            <strong>Transaction Data:</strong> Includes details about payments
            to and from you and other details of products you have purchased
            from us.
          </li>
          <li>
            <strong>Technical Data:</strong> Includes internet protocol (IP)
            address, browser type and version, time zone setting and location,
            browser plug-in types and versions, operating system and platform,
            and other technology on the devices you use to access this website.
          </li>
          <li>
            <strong>Usage Data:</strong> Includes information about how you use
            our website and products.
          </li>
        </ul>

        <Text variant="sectionHeading" className="text-xl font-bold mt-8 mb-2">
          3. How and why we use this data
        </Text>
        <Text variant="body">We use your data in the following ways:</Text>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            To process your orders including taking payment and delivery of your
            pottery. Without this data, we cannot fulfill the products you have
            purchased.
          </li>
          <li>
            To manage payments: your payment data is shared with our secure
            payment providers to process your transaction and protect our
            business against fraudulent transactions.
          </li>
          <li>
            To improve our website via analytics: we use Google Analytics to
            track how visitors interact with our website. This data is
            anonymised by Google and helps us improve our user experience. This
            tracking only occurs if you accept cookies on our website.
          </li>
          <li>
            To communicate with you: to be able to send you directly the
            marketing communications you have subscribed to and provide any help
            when you contact us directly.
          </li>
        </ul>

        <Text variant="sectionHeading" className="text-xl font-bold mt-8 mb-2">
          4. Disclosures of your personal data
        </Text>
        <Text variant="body">
          We do not sell your personal data. To run our online shop, we must
          share your personal data with the following trusted third parties:
        </Text>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Payment Gateways:</strong> Credit card processors and
            Klarna, to process your transaction securely. (If you use Klarna,
            they will process your data in accordance with their own privacy
            policy to assess whether you qualify for their payment options).
          </li>
          <li>
            <strong>Delivery Companies:</strong> Couriers and postal services
            (such as Royal Mail or other UK couriers) so they can deliver your
            physical orders.
          </li>
          <li>
            <strong>Analytics Providers:</strong> Google Analytics, to help us
            understand website traffic and performance.
          </li>
          <li>
            <strong>Professional Advisers:</strong> HM Revenue &amp; Customs
            (HMRC) and other regulators/authorities based in the United Kingdom
            if required for tax reporting purposes.
          </li>
        </ul>

        <Text variant="sectionHeading" className="text-xl font-bold mt-8 mb-2">
          5. International transfers
        </Text>
        <Text variant="body">
          Please note that we may transfer, store and process your personal
          information outside the country you live in. If we transfer your
          personal information out of the European Economic Area or the United
          Kingdom, we will rely on recognized transfer mechanisms like the
          European Commission&apos;s Standard Contractual Clauses, or any
          equivalent contracts issued by the relevant competent authority of the
          UK, as relevant, unless the data transfer is to a country that has
          been determined to provide an adequate level of protection.
        </Text>

        <Text variant="sectionHeading" className="text-xl font-bold mt-8 mb-2">
          6. Data retention
        </Text>
        <Text variant="body">
          We will only retain your personal data for as long as reasonably
          necessary to fulfill the purposes we collected it for, including for
          the purposes of satisfying any legal, regulatory, tax, accounting, or
          reporting requirements. Please be aware that no security measures are
          perfect or impenetrable and we cannot guarantee perfect security. In
          addition, any information you may send to us may not be secured while
          in transit. We recommend that you do not use unsecure channels to
          communication sensitive or confidential information to us.
        </Text>
        <Text variant="body">
          How long we retain your personal information depends on different
          factors, such as whether we need the information to maintain your
          account, to provide you with services, comply with legal obligations,
          resolve disputes or enforce other applicable contracts and policies.
          For tax purposes, UK law requires us to keep basic information about
          our customers and transactions (including Contact, Identity, and
          Transaction Data) for six years after they cease being customers.
        </Text>
        <Text variant="body">
          The data collected when you opt in to receive our marketing
          communications will be retained for up to 12 months after you
          unsubscribe or ask to be unsubscribed. You will no longer receive any
          marketing communications from us as soon as you unsubscribe.
        </Text>

        <Text variant="sectionHeading" className="text-xl font-bold mt-8 mb-2">
          8. Your legal rights
        </Text>
        <Text variant="body">
          Under UK data protection laws, you have rights in relation to your
          personal data, including the right to:
        </Text>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Request access to your personal data (a &quot;Subject Access
            Request&quot;).
          </li>
          <li>
            Request correction of the personal data that we hold about you.
          </li>
          <li>
            Request to delete of your personal data (&quot;the right to be
            forgotten&quot;).
          </li>
          <li>
            Object to processing of your personal data where we are relying on a
            legitimate interest.
          </li>
          <li>Request restriction of processing your personal data.</li>
          <li>
            Withdraw consent at any time where we are relying on consent to
            process your data (such as analytics cookies).
          </li>
        </ul>
        <Text variant="body">
          If you wish to exercise any of these rights, please contact us at
          curly.pottery@gmail.com. We may need to verify your identity before we
          can process your requests, as permitted or required under applicable
          law. In accordance with applicable laws, you may designate an
          authorized agent to make requests on your behalf to exercise your
          rights. Before accepting such a request from an agent, we will require
          that the agent provide proof you have authorized them to act on your
          behalf, and we may need you to verify your identity directly with us.
          We will respond to your request in a timely manner as required under
          applicable law.
        </Text>

        <Text variant="sectionHeading" className="text-xl font-bold mt-8 mb-2">
          9. Complaints
        </Text>
        <Text variant="body">
          If you have complaints about how we process your personal information,
          please contact us using the contact details provided above. Depending
          on where you live, you may have the right to appeal our decision by
          contacting us using the contact details, or lodge your complaint with
          your local data protection authority. For the EEA, you can find a list
          of the responsible data protection supervisory authorities here.
        </Text>

        <Text variant="sectionHeading" className="text-xl font-bold mt-8 mb-2">
          10. Changes to this Privacy Policy
        </Text>
        <Text variant="body">
          We may update this Privacy Policy from time to time, including to
          reflect changes to our practices or for other operational, legal, or
          regulatory reasons. We will post the revised Privacy Policy on this
          website, update the &quot;Last updated&quot; date and provide notice
          as required by applicable law.
        </Text>

        <Text variant="sectionHeading" className="text-xl font-bold mt-8 mb-2">
          11. Third party websites and links
        </Text>
        <Text variant="body">
          The Services may provide links to websites or other online platforms
          operated by third parties. If you follow links to sites not affiliated
          or controlled by us, you should review their privacy and security
          policies and other terms and conditions. We do not guarantee and are
          not responsible for the privacy or security of such sites, including
          the accuracy, completeness, or reliability of information found on
          these sites. Information you provide on public or semi-public venues,
          including information you share on third-party social networking
          platforms may also be viewable by other users of the Services and/or
          users of those third-party platforms without limitation as to its use
          by us or by a third party. Our inclusion of such links does not, by
          itself, imply any endorsement of the content on such platforms or of
          their owners or operators, except as disclosed on the Services.
        </Text>

        <Text variant="sectionHeading" className="text-xl font-bold mt-8 mb-2">
          12. Children&apos;s data
        </Text>
        <Text variant="body">
          The Services are not intended to be used by children, and we do not
          knowingly collect any personal information about children under the
          age of majority in your jurisdiction. If you are the parent or
          guardian of a child who has provided us with their personal
          information, you may contact us using the contact details set out
          below to request that it be deleted. As of the Effective Date of this
          Privacy Policy, we do not have actual knowledge that we
          &quot;share&quot; or &quot;sell&quot; (as those terms are defined in
          applicable law) personal information of individuals under 16 years of
          age.
        </Text>
      </section>
    </Container>
  )
}
