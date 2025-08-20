import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import Link from "@mui/material/Link";

export const metadata = {
  title: "User Agreement | Arogyaa",
  description: "Terms & Conditions for using Arogyaa.",
};

export default function TermsPage() {
  return (
    <>
      <Box sx={{ maxWidth: 900, mx: "auto", py: 2 }}>
        {/* ======= PAGE 1 ======= */}
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Arogyaa Health Technologies Private Limited
        </Typography>

        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontWeight: 700, textTransform: "uppercase" }}
        >
          TERMS AND CONDITIONS
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Last updated: Aug 19, 2025 · Version: terms@1.0.0
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          Arogyaa Health Technologies Private Limited, on behalf of itself and
          its affiliates/group companies under the brand &quot;Arogyaa
          Health&quot; (“Arogyaa”), is the author and publisher of the internet
          resource{" "}
          <Typography>
            <Link
              href="https://www.arogyaapatient.com"
              target="_blank"
              rel="nofollow noopener noreferrer"
            >
              www.arogyaapatient.com
            </Link>
          </Typography>
          and the mobile application ‘Arogyaa Health’ (together, “Website”).
          Arogyaa owns and operates the services provided through the Website.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
          1. NATURE AND APPLICABILITY OF TERMS
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          Please carefully go through these terms and conditions (“Terms”) and
          the privacy policy available at{" "}
          <Typography component="span" sx={{ fontWeight: 600 }}>
            https://www.arogyaapatient.com/privacy
          </Typography>{" "}
          (“Privacy Policy”) before you decide to access the Website or avail
          the services made available on the Website by Arogyaa. These Terms and
          the Privacy Policy together constitute a legal agreement (“Agreement”)
          between you and Arogyaa in connection with your visit to the Website
          and your use of the Services.
        </Typography>

        <Typography sx={{ fontWeight: 700, mb: 1 }}>
          The Agreement applies to you whether you are:
        </Typography>

        <List
          sx={{
            listStyleType: "lower-roman",
            pl: 3,
            "& .MuiListItem-root": { display: "list-item" },
          }}
        >
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary={
                <>
                  A medical practitioner or healthcare provider (whether an
                  individual professional or an organization) wishing to be
                  listed, or already listed, on the Website, including
                  designated, authorized associates of such practitioners or
                  institutions (“Practitioner(s)”, “you” or “User”); or
                </>
              }
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary={
                <>
                  A patient, his/her representatives or affiliates, searching
                  for Practitioners through the Website (“End-User”, “you” or
                  “User”); or
                </>
              }
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary={<>Otherwise a user of the Website (“you” or “User”).</>}
            />
          </ListItem>
        </List>

        <Typography sx={{ lineHeight: 1.8, mt: 1.5 }}>
          This Agreement applies to those services made available by Arogyaa on
          the Website, which are offered free of charge to the Users
          (“Services”), including the following:
        </Typography>

        <List
          sx={{
            listStyleType: "disc",
            pl: 3,
            mt: 1,
            "& .MuiListItem-root": { display: "list-item" },
          }}
        >
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary={
                <>
                  <strong>For Practitioners:</strong> Listing of Practitioners
                  and their profiles and contact details, to be made available
                  to the other Users and visitors to the Website;
                </>
              }
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary={
                <>
                  <strong>For other Users:</strong> Facility to create and
                  maintain ‘Health Accounts’, search for Practitioners by name,
                  specialty, and geographical area, or any other criteria that
                  may be developed and made available by Arogyaa, and to make
                  appointments with Practitioners.
                </>
              }
            />
          </ListItem>
        </List>

        {/* ======= PAGE 2 ======= */}
        <Typography sx={{ lineHeight: 1.8, mt: 2 }}>
          The Services may change from time to time, at the sole discretion of
          Arogyaa, and the Agreement will apply to your visit to and your use of
          the Website to avail the Service, as well as to all information
          provided by you on the Website at any given point in time.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mt: 2 }}>
          This Agreement defines the terms and conditions under which you are
          allowed to use the Website and describes the manner in which we shall
          treat your account while you are registered as a member with us. If
          you have any questions about any part of the Agreement, feel free to
          contact us at support@Arogyaapatient.com.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mt: 2 }}>
          By downloading or accessing the Website to use the Services, you
          irrevocably accept all the conditions stipulated in this Agreement,
          the Subscription Terms of Service and Privacy Policy, as available on
          the Website, and agree to abide by them. This Agreement supersedes all
          previous oral and written terms and conditions (if any) communicated
          to you relating to your use of the Website to avail the Services. By
          availing any Service, you signify your acceptance of the terms of this
          Agreement.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mt: 2 }}>
          We reserve the right to modify or terminate any portion of the
          Agreement for any reason and at any time, and such modifications shall
          be informed to you in writing. You should read the Agreement at
          regular intervals. Your use of the Website following any such
          modification constitutes your agreement to follow and be bound by the
          Agreement so modified.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mt: 2 }}>
          You acknowledge that you will be bound by this Agreement for availing
          any of the Services offered by us. If you do not agree with any part
          of the Agreement, please do not use the Website or avail any Services.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mt: 2 }}>
          Your access to use of the Website and the Services will be solely at
          the discretion of Arogyaa. The Agreement is published in compliance
          of, and is governed by the provisions of Indian law, including but not
          limited to:
        </Typography>

        <List
          sx={{
            listStyleType: "disc",
            pl: 3,
            mt: 1,
            "& .MuiListItem-root": { display: "list-item" },
          }}
        >
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary="the Indian Contract Act, 1872,"
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary="the (Indian) Information Technology Act, 2000, and"
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary={
                <>
                  the rules, regulations, guidelines and clarifications framed
                  thereunder, including the (Indian) Information Technology
                  (Reasonable Security Practices and Procedures and Sensitive
                  Personal Information) Rules, 2011 (the “SPI Rules”), and the
                  (Indian) Information Technology (Intermediaries Guidelines)
                  Rules, 2011 (the “IG Rules”).
                </>
              }
            />
          </ListItem>
        </List>

        <Typography variant="h6" sx={{ fontWeight: 800, mt: 3, mb: 1.5 }}>
          2. CONDITIONS OF USE
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          You must be 18 years of age or older to register, use the Services, or
          visit or use the Website in any manner. By registering, visiting, and
          using the Website or accepting this Agreement, you represent and
          warrant to Arogyaa that you are 18 years of age or older, and that you
          have the
        </Typography>

        {/* ======= PAGE 3 ======= */}
        <Typography sx={{ lineHeight: 1.8, mt: 2 }}>
          right, authority, and capacity to use the Website and the Services
          available through the Website, and agree to and abide by this
          Agreement.
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 800, mt: 3, mb: 1.5 }}>
          3. TERMS OF USE APPLICABLE TO ALL USERS OTHER THAN PRACTITIONERS
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
          3.1 END-USER ACCOUNT AND DATA PRIVACY
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.1.1 The terms “personal information” and “sensitive personal data or
          information” are defined under the SPI Rules and are reproduced in the
          Privacy Policy.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.1.2 Arogyaa may by its Services collect information relating to the
          devices through which you access the Website, and anonymous data of
          your usage. The collected information will be used only for improving
          the quality of Arogyaa’s services and to build new services.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.1.3 The Website allows Arogyaa to have access to registered Users’
          personal email or phone number, for communication purpose so as to
          provide you a better way of booking appointments and for obtaining
          feedback in relation to the Practitioners and their practice.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1 }}>
          3.1.4 The Privacy Policy sets out, inter-alia:
        </Typography>

        {/* Bulleted points under 3.1.4 */}
        <List
          sx={{
            listStyleType: "disc",
            pl: 3,
            "& .MuiListItem-root": { display: "list-item" },
          }}
        >
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary="The type of information collected from Users, including sensitive personal data or information;"
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary="The purpose, means and modes of usage of such information;"
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary="How and to whom Arogyaa will disclose such information; and,"
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary="Other information mandated by the SPI Rules."
            />
          </ListItem>
        </List>

        <Typography sx={{ lineHeight: 1.8, mt: 2 }}>
          3.1.5 The User is expected to read and understand the Privacy Policy
          so as to ensure that he or she has the knowledge of, inter-alia:
        </Typography>

        {/* Bulleted points under 3.1.5 */}
        <List
          sx={{
            listStyleType: "disc",
            pl: 3,
            "& .MuiListItem-root": { display: "list-item" },
          }}
        >
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary="the fact that certain information is being collected;"
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary="the purpose for which the information is being collected;"
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary="the intended recipients of the information;"
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary="the nature of collection and retention of the information; and"
            />
          </ListItem>
        </List>

        {/* ======= PAGE 4 ======= */}
        {/* 3.4.x continued */}
        <Typography sx={{ lineHeight: 1.8, mt: 2, mb: 1 }}>
          <strong>iii.</strong> Following instances, solely at the discretion of
          Arogyaa, would be construed as valid cases of PNS (“Valid PNS”), in
          which case the User shall be penalized as per Clause 3.4.6 (a):
        </Typography>

        {/* (a), (b) as lower-alpha list */}
        <List
          sx={{
            listStyleType: "lower-alpha",
            pl: 3,
            "& .MuiListItem-root": { display: "list-item" },
          }}
        >
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary={
                <>
                  User does not reply within seven (7) days, with reasons to PNS
                  Communication, from the date of receipt of such PNS
                  Communication;
                </>
              }
            />
          </ListItem>

          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8, mb: 1 } }}
              primary="In case User responds to the PNS Communication with below reasons:"
            />
            {/* nested bullet list under (b) */}
            <List
              sx={{
                listStyleType: "disc",
                pl: 3,
                "& .MuiListItem-root": { display: "list-item" },
              }}
            >
              <ListItem sx={{ py: 0.25 }}>
                <ListItemText
                  primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
                  primary="Forgot the appointment"
                />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemText
                  primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
                  primary="Chose to visit another Practitioner/consulted online;"
                />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemText
                  primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
                  primary="Busy with other work; or such other reasons (which Arogyaa at its discretion decides to be a valid reason to not show up)."
                />
              </ListItem>
            </List>
          </ListItem>
        </List>

        {/* (c) paragraph */}
        <Typography sx={{ lineHeight: 1.8, mt: 1.5 }}>
          <strong>c.</strong> Where the User has booked a paid appointment and
          is unable to visit the Practitioner, due to such genuine reasons of
          sickness etc., at the sole discretion of Arogyaa, pursuant to
          conducting an investigation, the User shall be provided with a refund
          of such payment made by User, at the time of booking. However, where
          cancellation charges have been levied, you would not be entitled to a
          complete refund.
        </Typography>

        {/* iv. paragraph */}
        <Typography sx={{ lineHeight: 1.8, mt: 1.5 }}>
          <strong>iv.</strong> Arogyaa reserves the right to make the final
          decision in case of a conflict. The total aggregate liability of
          Arogyaa with respect to any claims made herein shall be INR 200.
        </Typography>

        {/* 3.4.7 heading */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
          3.4.7 Cancellation and Refund Policy
        </Typography>

        {/* (i), (ii) as lower-roman list */}
        <List
          sx={{
            listStyleType: "lower-roman",
            pl: 3,
            "& .MuiListItem-root": { display: "list-item" },
          }}
        >
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary={
                <>
                  In the event that, the Practitioner with whom User has booked
                  a paid appointment via the Website, has not been able to meet
                  the User, User will need to write to us at
                  support@Arogyaapatient.com within five (5) days from the
                  occurrence of such event; in which case, the entire
                  consultation amount as mentioned on the Website will be
                  refunded to the User within the next five (5) to six (6)
                  business days in the original mode of payment done by the User
                  while booking. In case where the User, does not show up for
                  the appointment booked with a Practitioner, without cancelling
                  the appointment beforehand, the amount will not be refunded,
                  and treated as under Clause 3.4.6. However, where cancellation
                  charges have been levied (as charged by the
                  Practitioner/Practice), you would not be entitled to a
                  complete refund even if you have cancelled beforehand.
                </>
              }
            />
          </ListItem>

          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary={
                <>
                  Users will not be entitled for any refunds in cases where the
                  Practitioner is unable to meet the User at the exact time of
                  the scheduled appointment time and the User is required to
                  wait, irrespective of the fact whether the User is required to
                  wait or choose to not obtain the medical services from the
                  said Practitioner.
                </>
              }
            />
          </ListItem>
        </List>
        {/* ======= END PAGE 4 ======= */}

        {/* ======= PAGE 5 ======= */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
          3.5 NO DOCTOR-PATIENT RELATIONSHIP; NOT FOR EMERGENCY USE
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.5.1 Please note that some of the content, text, data, graphics,
          images, information, suggestions, guidance, and other material
          (collectively, “Information”) that may be available on the Website
          (including information provided in direct response to your questions
          or postings) may be provided by individuals in the medical profession.
          The provision of such Information does not create a licensed medical
          professional/patient relationship between Arogyaa and you and does not
          constitute an opinion, medical advice, or diagnosis or treatment of
          any particular condition, but is only provided to assist you with
          locating appropriate medical care from a qualified practitioner.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.5.2 It is hereby expressly clarified that, the Information that you
          obtain or receive from Arogyaa, and its employees, contractors,
          partners, sponsors, advertisers, licensors or otherwise on the Website
          is for informational purposes only. We make no guarantees,
          representations or warranties, whether expressed or implied, with
          respect to professional qualifications, quality of work, expertise or
          other information provided on the Website. In no event shall we be
          liable to you or anyone else for any decision made or action taken by
          you in reliance on such information.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          3.5.3 The Services are not intended to be a substitute for getting in
          touch with emergency healthcare. If you are an End-User facing a
          medical emergency (either on your or another person’s behalf), please
          contact an ambulance service or hospital directly.
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
          3.6 CONSULT
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          Click here to view Consult terms &amp; conditions.
          <br />
          (Note: You can include a link to your separate Consult T&amp;C page
          here.)
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
          3.7 Arogyaa HEALTH FEED
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.7.1 Arogyaa Health Feed is an online content platform available on
          the Website, wherein Practitioners who have created a profile can log
          in and post health and wellness-related content.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.7.2 Practitioners can use Arogyaa Health Feed by logging in from
          their health account, creating original content comprising text,
          audio, video, images, data or any combination of the same (“Content”),
          and uploading said Content to Arogyaa’s servers. Arogyaa will make
          available to the User a gallery of images licensed by Arogyaa from a
          third-party stock image provider (“Arogyaa Gallery”). The User can
          upload their own images or choose an image from the Arogyaa Gallery.
          Arogyaa does not provide any warranty as to the ownership of the
          intellectual property in the Arogyaa Gallery and the User acknowledges
          that the User will use the images
        </Typography>

        {/* ======= PAGE 6 ======= */}
        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          from the Arogyaa Gallery at their own risk. Arogyaa shall post such
          Content to Arogyaa Health Feed at its own option and subject to these
          Terms and Conditions. The Content uploaded via Arogyaa Health Feed
          does not constitute medical advice and may not be construed as such by
          any person.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.7.3 Practitioners acknowledge that they are the original authors and
          creators of any Content uploaded by them via Arogyaa Health Feed and
          that no Content uploaded by them would constitute infringement of the
          intellectual property rights of any other person. Arogyaa reserves the
          right to remove any Content which it may determine at its own
          discretion as violating the intellectual property rights of any other
          person, including but not limited to patent, trademark, copyright or
          other proprietary rights. Practitioner agrees to absolve Arogyaa from
          and indemnify Arogyaa against all claims that may arise as a result of
          any third-party intellectual property right claim that may arise from
          the Practitioner’s uploading of any Content on the Arogyaa Health
          Feed. The Practitioner may not use the images in the Arogyaa Gallery
          for any purpose other than those directly related to the creation and
          uploading of Content to Arogyaa Health Feed. The Practitioner also
          agrees to absolve Arogyaa from and indemnify Arogyaa against all
          claims that may arise as a result of any third-party intellectual
          property claim if the Practitioner downloads, copies or otherwise
          utilizes an image from the Arogyaa Gallery for his/her personal or
          commercial gain.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.7.4 Practitioner hereby assigns to Arogyaa, in perpetuity and
          worldwide, all intellectual property rights in any Content created by
          the User and uploaded by the User via Arogyaa Health Feed.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.7.5 Arogyaa shall have the right to edit or remove the Content and
          any comments in such manner as it may deem fit at any time.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.7.6 Practitioner shall ensure that the Content or any further
          responses to the Content (including responses to Users) is not
          harmful, harassing, blasphemous, defamatory, obscene, pornographic,
          paedophilic or libelous in any manner. Further, Practitioner should
          ensure that the Content is not invasive of any other person’s privacy,
          or otherwise contains any elements that is hateful, racially or
          ethnically objectionable, disparaging, or otherwise unlawful in any
          manner whatever. Arogyaa reserves the right to remove any Content
          which it may determine at its own discretion is violative of these
          Terms and Conditions or any law or statute in force at the time. Also,
          the Practitioner agrees to absolve Arogyaa from and indemnify Arogyaa
          against all claims that may arise as a result of any legal claim
          arising from the nature of the Content posted by the Practitioner on
          Arogyaa Health Feed.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.7.7 Practitioner shall ensure that no portion of the Content is
          violative of any law for the time being in force.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          3.7.8 Practitioner shall ensure that the Content is not threatening
          the unity, integrity, defence, security or sovereignty of India,
          friendly relations with foreign states, or public order. Further the
          Practitioner shall ensure that the Content will not cause incitement
          to the commission of any cognizable offence or prevent investigation
          of any offence or is insulting to any other nation.
        </Typography>
        {/* ======= END PAGE 6 ======= */}

        {/* ======= PAGE 7 ======= */}
        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.7.9 User may also use Arogyaa Health Feed in order to view original
          content created by Practitioners and to create and upload comments on
          such Content, where allowed (“User Comment”).
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.7.10 User acknowledges that the User Comment reflects the views and
          opinions of the authors of such Content and do not necessarily reflect
          the views of Arogyaa.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.7.11 User agrees that the Content they access on Arogyaa Health Feed
          does not in any way constitute medical advice and that the
          responsibility for any act or omission by the User arising from the
          User’s interpretation of the Content is solely attributable to the
          User. The User agrees to absolve Arogyaa from and indemnify Arogyaa
          against all claims that may arise as a result of the User’s actions
          resulting from the User’s viewing of Content on Arogyaa Health Feed.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.7.12 User acknowledges that all intellectual property rights in the
          User Comment on Arogyaa Health Feed vest with Arogyaa. The User agrees
          not to infringe upon Arogyaa’s intellectual property by copying or
          plagiarizing content on Arogyaa Health Feed. Arogyaa reserves its
          right to initiate all necessary legal remedies available to them in
          case of such an infringement by the User. Also, User Comment will be
          the sole intellectual property of Arogyaa. The User agrees not to post
          User Comment that would violate the intellectual property of any third
          party, including but not limited to patent, trademark, copyright or
          other proprietary rights. Arogyaa reserves the right to remove any
          User Comment which it may determine at its own discretion as violating
          the intellectual property rights of any third party. The User agrees
          to absolve Arogyaa from and indemnify Arogyaa against all claims that
          may arise as a result of any third party intellectual property right
          claim that may arise from the User Comment.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          3.7.13 User shall ensure that the User Comment is not harmful,
          harassing, blasphemous, defamatory, obscene, pornographic, paedophilic
          or libelous in any manner. Further, User should ensure that the User
          Comment is not invasive of any other person’s privacy, or otherwise
          contains any elements that is hateful, racially or ethnically
          objectionable, disparaging, or otherwise unlawful in any manner
          whatever. Arogyaa reserves the right to remove any Content which it
          may determine at its own discretion is violative of these Terms and
          Conditions or any law or statute in force at the time. Also, the User
          agrees to absolve Arogyaa from and indemnify Arogyaa against all
          claims that may arise as a result of any legal claim arising from the
          nature of the User Comment.
        </Typography>
        {/* ======= END PAGE 7 ======= */}

        {/* ======= PAGE 8 ======= */}
        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.7.14 User shall ensure that the User Comment is not threatening the
          unity, integrity, defence, security or sovereignty of India, friendly
          relations with foreign states, or public order. Further the User shall
          ensure that the User Comment will not cause incitement to the
          commission of any cognizable offence or prevent investigation of any
          offence or is insulting to any other nation.
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
          3.8 CONTENT OWNERSHIP AND COPYRIGHT CONDITIONS OF ACCESS
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.8.1 The contents listed on the Website are (i) User-generated
          content, or (ii) belong to Arogyaa. The information that is collected
          by Arogyaa directly or indirectly from the End-Users and the
          Practitioners shall belong to Arogyaa. Copying of the copyrighted
          content published by Arogyaa on the Website for any commercial purpose
          or for the purpose of earning profit will be a violation of copyright
          and Arogyaa reserves its rights under applicable law accordingly.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          3.8.2 Arogyaa authorizes the User to view and access the content
          available on or from the Website solely for ordering, receiving,
          delivering and communicating only as per this Agreement. The contents
          of the Website, information, text, graphics, images, logos, button
          icons, software code, design, and the collection, arrangement and
          assembly of content on the Website (collectively, "Arogyaa Content"),
          are the property of Arogyaa and are protected under copyright,
          trademark and other laws. User shall not modify the Arogyaa Content or
          reproduce, display, publicly perform, distribute, or otherwise use the
          Arogyaa Content in any way for any public or commercial purpose or for
          personal gain.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          3.8.3 User shall not access the Services for purposes of monitoring
          their availability, performance or functionality, or for any other
          benchmarking or competitive purposes.
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
          3.9 REVIEWS AND FEEDBACK
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          By using this Website, you agree that any information shared by you
          with Arogyaa or with any Practitioner will be subject to our Privacy
          Policy.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          You are solely responsible for the content that you choose to submit
          for publication on the Website, including any feedback, ratings, or
          reviews (“Critical Content”) relating to Practitioners or other
          healthcare professionals. The role of Arogyaa in publishing Critical
          Content is restricted to that of an ‘intermediary’ under the
          Information Technology Act, 2000. Arogyaa disclaims all responsibility
          with respect to the content of Critical Content, and its role with
          respect to such content is restricted to its obligations as an
          ‘intermediary’ under the said Act.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          Arogyaa shall not be liable to pay any consideration to any User for
          re-publishing any content across any of its platforms.
        </Typography>
        {/* ======= END PAGE 8 ======= */}

        {/* ======= PAGE 9 ======= */}
        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          Your publication of reviews and feedback on the Website is governed by
          Clause 5 of these Terms. Without prejudice to the detailed terms
          stated in Clause 5, you hereby agree not to post or publish any
          content on the Website that (a) infringes any third-party intellectual
          property or publicity or privacy rights, or (b) violates any
          applicable law or regulation, including but not limited to the IG
          Rules and SPI Rules. Arogyaa, at its sole discretion, may choose not
          to publish your reviews and feedback, if so required by applicable
          law, and in accordance with Clause 5 of these Terms. You agree that
          Arogyaa may contact you through telephone, email, SMS, or any other
          electronic means of communication for the purpose of:
        </Typography>

        {/* roman numeral list */}
        <List
          sx={{
            listStyleType: "lower-roman",
            pl: 3,
            "& .MuiListItem-root": { display: "list-item" },
          }}
        >
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary="Obtaining feedback in relation to Website or Arogyaa’s services; and/or"
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary="Obtaining feedback in relation to any Practitioners listed on the Website; and/or"
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary="Resolving any complaints, information, or queries by Practitioners regarding your Critical Content;"
            />
          </ListItem>
        </List>

        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          and you agree to provide your fullest co-operation further to such
          communication by Arogyaa. Arogyaa’s Feedback Collection and Fraud
          Detection Policy, is annexed as the Schedule hereto, and remains
          subject always to these Terms.
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
          3.10 RECORDS
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.5 }}>
          Arogyaa may provide End-Users with a free facility known as ‘Records’
          on its mobile application ‘Arogyaa Health’. Information available in
          your Records is of two types:
        </Typography>

        <List
          sx={{
            listStyleType: "lower-roman",
            pl: 3,
            "& .MuiListItem-root": { display: "list-item" },
          }}
        >
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary="User-created: Information uploaded by you or information generated during your interaction with the Arogyaa ecosystem, e.g., appointment, medicine order placed by you."
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primaryTypographyProps={{ sx: { lineHeight: 1.8 } }}
              primary="Practice-created: Health Records generated by your interaction with a Practitioner who uses Arogyaa or other services of Arogyaa software."
            />
          </ListItem>
        </List>

        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          The specific terms relating to such Health Account are as below,
          without prejudice to the rest of these Terms and the Privacy Policy:
        </Typography>

        {/* numbered clauses under 3.10 */}
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.1 Your Records is only created after you have signed up and
          explicitly accepted these Terms.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.2 Any Practice-created Health Record is provided on an as-is
          basis at the sole intent, risk and responsibility of the Practitioner
          and Arogyaa does not validate the said information and makes no
          representation in connection therewith. You should contact the
          relevant Practitioner in case you wish to point out any discrepancies
          or add, delete, or modify the Health Record in any manner.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.3 The Health Records are provided on an as-is basis. While we
          strive to maintain the highest levels of service availability, Arogyaa
          is not liable for any interruption that may be caused to your access
          of the Services.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.4 The reminder provided by the Records is only a supplementary
          way of reminding you to perform your activities as prescribed by your
          Practitioner. In the event of any medicine reminders provided by
          Arogyaa, you should refer to your prescription before taking any
          medicines. Arogyaa is not liable if for any reason reminders are not
          delivered to you or are delivered late or delivered incorrectly,
          despite its best efforts. In case you do not wish to receive the
          reminders, you can switch it off through the Arogyaa app.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.5 It is your responsibility to keep your correct mobile number
          and email ID updated in the Records. The Health Records will be sent
          to the Records associated with this mobile number and/or email ID.
          Every time you change any contact information (mobile or email), we
          will send a confirmation. Arogyaa is not responsible for any loss or
          inconvenience caused due to your failure in updating the contact
          details with Arogyaa.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.6 Arogyaa uses industry-level security and encryption to your
          Health Records. However, Arogyaa does not guarantee to prevent
          unauthorized access if you lose your login credentials or they are
          otherwise compromised. In the event you are aware of any unauthorized
          use or access, you shall immediately inform Arogyaa of such
          unauthorized use or access. Please safeguard your login credentials
          and report any actual or suspected breach of account to
          support@Arogyaapatient.com.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.7 If you access your dependents’ Health Records by registering
          your dependents with your own Records, you are deemed to be
          responsible for the Health Records of your dependents and all
          obligations that your dependents would have had, had they maintained
          their own separate individual Records. You agree that it shall be your
          sole responsibility to obtain prior consent of your dependent and
          shall have right to share, upload and publish any sensitive personal
          information of your dependent. Arogyaa assumes no responsibility for
          any claim, dispute or liability arising in this regard, and you shall
          indemnify Arogyaa and its officers against any such claim or liability
          arising out of unauthorized use of such information.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.8 In case you want to delete your Records, you can do so by
          contacting our service support team. However only your account and any
          associated Health Records will be deleted, and your Health Records
          stored by your Practitioners will continue to be stored in their
          respective accounts.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.9 You may lose your “User created” record, if the data is not
          synced with the server.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.10 If the Health Record is unassessed for a stipulated time, you
          may not be able to access your Health Records due to security reasons.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.11 Arogyaa is not liable if for any reason, Health Records are
          not delivered to you or are delivered late despite its best efforts.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.12 The Health Records are shared with the phone numbers that are
          provided by your Practitioner. Arogyaa is not responsible for adding
          the Health Records with incorrect numbers if those incorrect numbers
          are provided by the Practitioner.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.13 Arogyaa is not responsible or liable for any content, fact,
          Health Records, medical deduction or the language used in your Health
          Records whatsoever. Your Practitioner is solely responsible and liable
          for your Health Records and any information provided to us including
          but not limited to the content in them.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.14 Arogyaa has the ability in its sole discretion to retract
          Health Records without any prior notice if they are found to be shared
          incorrectly or inadvertently.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.15 Arogyaa will follow the law of the land in case of any
          constitutional court or jurisdiction mandates to share the Health
          Records for any reason.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.16 You agree and acknowledge that Arogyaa may need to access the
          Health Record for cases such as any technical or operational issue of
          the End User in access or ownership of the Records.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.17 You acknowledge that the Practitioners you are visiting may
          engage Arogyaa's software or third party software for the purposes of
          the functioning of the Practitioner’s business and Arogyaa's services
          including but not limited to the usage and for storage of Records (as
          defined in Section 3.10) in India and outside India, in accordance
          with the applicable laws.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.10.18 To the extent that your Records have been shared with Arogyaa
          or stored on any of the Arogyaa products used by Practitioners you are
          visiting, and may in the past have visited, You hereby agree to the
          storage of your Records by Arogyaa pertaining to such previously
          visited clinics and hospitals who have tie ups with Arogyaa for the
          purposes of their business and for Arogyaa's services including but
          not limited to the usage and for storage of Records (as defined in
          Section 3.10) in India and outside India, in accordance with the
          applicable laws and further agree, upon creation of your account with
          Arogyaa, to the mapping of such Records as may be available in
          Arogyaa’s database to your User account.
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
          3.11 MEDICINE INFORMATION
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.11.1 The medicine and health-related information on the Website is
          provided for general informational and educational purposes only and
          is not intended as medical advice or as a substitute for professional
          health care advice, diagnosis, or treatment. It should not be relied
          upon for the treatment of any medical condition or health problem.
          Always consult your doctor or other qualified healthcare provider for
          medical advice and before starting any new treatment.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          3.11.2 Arogyaa does not endorse or recommend any specific tests,
          doctors, products, procedures, opinions, or other information that may
          be mentioned on the Website. Reliance on any information appearing on
          the Website is solely at your own risk.
        </Typography>
        {/* ======= END PAGE 9 ======= */}

        {/* ======= PAGE 10–12 ======= */}

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
          3.12 Q&amp;A
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.12.1 The Q&amp;A (Question and Answer) platform is a feature offered
          by Arogyaa through which Users may submit health-related questions and
          receive answers from Practitioners listed on the Website.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.12.2 The Q&amp;A platform is intended for general informational
          purposes only. Answers on the platform are provided by independent
          medical practitioners and not by Arogyaa. The content is not a
          substitute for professional medical advice, diagnosis, or treatment.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.12.3 Arogyaa makes no guarantees, representations, or warranties,
          whether expressed or implied, with respect to the answers provided
          through the Q&amp;A platform. Arogyaa shall not be liable for any
          damages arising from the use of such content.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.12.4 Users are responsible for any decisions or actions they take
          based on information received through the Q&amp;A platform. Users
          should not disregard professional medical advice or delay in seeking
          it because of content on the Q&amp;A platform.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          3.12.5 Arogyaa may, at its discretion, remove any content or answer
          that it deems to be in violation of the law, its policies, or that may
          be harmful to its users or its brand.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          3.12.6 Practitioners answering questions via the Q&amp;A platform
          agree to provide accurate, professional, and ethical responses.
          Arogyaa reserves the right to suspend or remove any Practitioner who
          violates these expectations.
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          4. TERMS OF USE PRACTITIONERS
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
          4.1 LISTING POLICY
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          4.1.1 Arogyaa, directly and indirectly, collects information regarding
          the Practitioners’ profiles, contact details, and practice. Arogyaa
          reserves the right to take down any Practitioner’s profile as well as
          the right to display the profile of the Practitioners, with or without
          notice to the concerned Practitioner.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          4.1.2 Arogyaa reserves the right to moderate the suggestions and
          feedback provided by the Users on a Practitioner’s profile. Arogyaa
          shall not be liable for any adverse actions taken by Users based on
          such feedback.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          4.1.3 Practitioners explicitly agree that Arogyaa reserves the right
          to publish the content provided by Practitioners to Arogyaa, including
          content about themselves and their practice, and also content provided
          by Users on their profile.
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
          4.2 PROFILE OWNERSHIP AND EDITING RIGHTS
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          Arogyaa ensures easy access to the Practitioners by providing a tool
          to update your profile information. Arogyaa reserves the right of
          ownership of all Practitioner profiles and photographs and to moderate
          the changes or updates requested by Practitioners. However, Arogyaa
          takes the independent decision whether to publish or reject the
          requests submitted for the respective updates. You hereby represent
          and warrant that you are fully entitled under law to upload all
          content uploaded by you as part of your profile or otherwise while
          using Arogyaa’s services, and that no such content breaches any
          third-party rights, including intellectual property rights. Upon
          becoming aware of a breach of the foregoing representation, Arogyaa
          may modify or delete parts of your profile information at its sole
          discretion with or without notice to you.
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
          4.3 REVIEWS AND FEEDBACK DISPLAY RIGHTS OF Arogyaa
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          4.3.1 All Critical Content is content created by the Users of
          <Typography>
            <Link
              href="https://www.arogyaapatient.com"
              target="_blank"
              rel="nofollow noopener noreferrer"
            >
              www.arogyaapatient.com
            </Link>
          </Typography>{" "}
          (“Website”) and the clients of Arogyaa customers and Practitioners,
          including the End-Users. As a platform, Arogyaa does not take
          responsibility for Critical Content and its role with respect to
          Critical Content is restricted to that of an ‘intermediary’ under the
          Information Technology Act, 2000.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          4.3.2 The Practitioner hereby agrees not to post or publish any
          content on the Website that (a) infringes any third-party intellectual
          property or publicity or privacy rights, or (b) violates any
          applicable law or regulation. Arogyaa, at its sole discretion, may
          choose not to publish your reviews and feedback, if so required by
          applicable law.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          4.3.3 The Practitioner acknowledges that all feedback given by an
          End-User will be published by Arogyaa at its discretion. The
          Practitioner accepts the publication of such feedback without recourse
          to claim defamation, damages, or any liability against Arogyaa.
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
          4.4 RELEVANCE ALGORITHM
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          Arogyaa’s relevance algorithm for the Practitioners is a fully
          automated system that lists the Practitioners, their profile, and
          information regarding their practice on its Website. These listings do
          not represent any fixed objective ranking or endorsement by Arogyaa.
          Arogyaa will not be liable for any change in the relevance of the
          Practitioners on search results, which may take place from time to
          time.
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
          4.5 INDEPENDENT CONTRACTOR STATUS
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          Practitioners acknowledge that they are independent contractors and
          not employees, agents, or representatives of Arogyaa. Arogyaa’s role
          is limited to providing a technology platform for the facilitation of
          interactions between Practitioners and End-Users.
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
          4.6 PRACTITIONER UNDERTAKINGS
        </Typography>

        <List
          sx={{
            listStyleType: "disc",
            pl: 3,
            "& .MuiListItem-root": { display: "list-item" },
          }}
        >
          <ListItem>
            <ListItemText primary="is qualified to provide medical services within the territory of India;" />
          </ListItem>
          <ListItem>
            <ListItemText primary="has obtained all licenses as required by applicable laws;" />
          </ListItem>
          <ListItem>
            <ListItemText primary="shall not impersonate any other person;" />
          </ListItem>
          <ListItem>
            <ListItemText primary="shall not indulge in or promote any unlawful activities;" />
          </ListItem>
          <ListItem>
            <ListItemText primary="shall comply with applicable laws." />
          </ListItem>
        </List>

        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          Practitioners agree to indemnify and hold harmless Arogyaa from and
          against any claim or liability arising out of violation of the above.
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          5. RIGHTS AND OBLIGATIONS RELATING TO CONTENT
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
          5.1 PROPRIETARY RIGHTS
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          5.1.1 Arogyaa solely and exclusively owns the intellectual property
          rights in all content provided on the Website, other than
          User-generated content.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          5.1.2 The information that is collected by Arogyaa directly or
          indirectly from the End-Users and the Practitioners shall belong to
          Arogyaa. Copying of the copyrighted content published by Arogyaa on
          the Website for any commercial purpose or for the purpose of earning
          profit will be a violation of copyright and Arogyaa reserves its
          rights under applicable law accordingly.
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
          5.2 CONTENT PROVIDED BY USERS
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          5.2.1 You are responsible for the content that you post or submit,
          including feedback, reviews, and questions. You represent that you
          have the necessary rights to do so, and that such content does not
          infringe or violate any third-party rights.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          5.2.2 You hereby grant Arogyaa an irrevocable, worldwide, royalty-free
          license to use, copy, distribute, display, and create derivative works
          of such content.
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          5.2.3 You agree not to submit content that:
        </Typography>

        <List
          sx={{
            listStyleType: "disc",
            pl: 3,
            "& .MuiListItem-root": { display: "list-item" },
          }}
        >
          <ListItem>
            <ListItemText primary="Is false, misleading, defamatory, obscene, abusive, hateful, or racially or ethnically objectionable;" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Violates any applicable law or regulation;" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Infringes on the intellectual property rights of others." />
          </ListItem>
        </List>

        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          5.2.4 Arogyaa reserves the right to remove or modify content at its
          sole discretion without notice.
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          6. TERMINATION
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          6.1 Arogyaa reserves the right to suspend or terminate your access to
          the Website and Services at its sole discretion, without notice, for
          conduct that Arogyaa believes violates these Terms or is harmful to
          other Users, Arogyaa, or third parties, or for any other reason.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          6.2 Upon termination, your right to use the Website and the Services
          will immediately cease. All provisions of the Terms which by their
          nature should survive termination shall survive, including ownership
          provisions, warranty disclaimers, indemnity, and limitations of
          liability.
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          7. LIMITATION OF LIABILITY
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          7.1 In no event shall Arogyaa, its officers, directors, employees,
          partners, or agents be liable to you or any third party for any
          indirect, incidental, special, consequential, punitive, or exemplary
          damages, including but not limited to damages for loss of profits,
          goodwill, use, data, or other intangible losses arising from your use
          of the Website or Services, even if Arogyaa has been advised of the
          possibility of such damages.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          7.2 Notwithstanding anything to the contrary contained herein,
          Arogyaa’s liability to you for any cause whatsoever and regardless of
          the form of the action will at all times be limited to the amount
          paid, if any, by you to Arogyaa for the Services during the term of
          membership.
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          8. INDEMNITY
        </Typography>

        <List
          sx={{
            listStyleType: "disc",
            pl: 3,
            "& .MuiListItem-root": { display: "list-item" },
          }}
        >
          <ListItem>
            <ListItemText primary="your use of and access to the Website and Services;" />
          </ListItem>
          <ListItem>
            <ListItemText primary="your violation of any term of these Terms;" />
          </ListItem>
          <ListItem>
            <ListItemText primary="your violation of any third-party right, including without limitation any copyright, property, or privacy right;" />
          </ListItem>
          <ListItem>
            <ListItemText primary="any claim that your content caused damage to a third party." />
          </ListItem>
        </List>

        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          9. APPLICABLE LAW AND DISPUTE SETTLEMENT
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          9.1 These Terms shall be governed by and construed in accordance with
          the laws of India.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          9.2 The courts of Noida, Uttar Pradesh, shall have exclusive
          jurisdiction in relation to any disputes arising out of or in
          connection with these Terms, your use of the Website, or the Services.
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          9.3 Any disputes arising out of or in connection with these Terms
          shall be resolved by arbitration in accordance with the Arbitration
          and Conciliation Act, 1996. The arbitration shall be conducted by a
          sole arbitrator appointed by Arogyaa. The seat of arbitration shall be
          Noida, Uttar Pradesh. The language of arbitration shall be English.
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          10. SEVERABILITY
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          If any provision of these Terms is found to be unenforceable or
          invalid by a court of competent jurisdiction, that provision will be
          limited or eliminated to the minimum extent necessary so that these
          Terms will otherwise remain in full force and effect and enforceable.
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          11. WAIVER
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          The failure of Arogyaa to enforce any right or provision of these
          Terms will not be deemed a waiver of such right or provision.
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          12. CONTACT INFORMATION
        </Typography>

        <Typography sx={{ lineHeight: 1.8, mb: 1.2 }}>
          If you have any questions about these Terms, please contact us at:
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 0.8 }}>
          <strong>Arogyaa Health Technologies Private Limited</strong>
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 0.8 }}>
          Email:{" "}
          <Link
            href="mailto:support@Arogyaapatient.com"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
          >
            support@Arogyaapatient.com
          </Link>
        </Typography>

        <Typography>
          <Link
            href="https://www.arogyaapatient.com"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            www.arogyaapatient.com
          </Link>
        </Typography>
        <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
          Registered office: Noida, Uttar Pradesh, India.
        </Typography>

        {/* ======= END FINAL PAGE ======= */}
      </Box>

      <Box>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Arogyaa Health – Terms and Conditions
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Last updated: Aug 19, 2025 · Version: terms@1.0.0
        </Typography>
        <Divider sx={{ my: 2 }} />

        {/* ------------------------- INTRO ------------------------- */}
        <Typography paragraph>
          Arogyaa Health Private Limited, on behalf of itself and its
          affiliates/group companies under the brand <strong>“Arogyaa”</strong>{" "}
          (“Arogyaa”), is the author and publisher of the internet resource{" "}
          <strong>www.Arogyaa.com</strong> and the mobile application
          <strong> ‘Arogyaa’</strong> (together, “Website”).
        </Typography>

        {/* ------------------------- 1 ------------------------- */}
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          1. NATURE AND APPLICABILITY OF TERMS
        </Typography>
        <Typography paragraph>
          These Terms and Conditions (“Terms”), together with the Privacy Policy
          available at [Arogyaa Privacy Policy link], form a binding legal
          agreement (“Agreement”) between you and Arogyaa.
        </Typography>
        <Typography paragraph>
          By accessing the Website or availing the Services, you agree to comply
          with these Terms. The Agreement applies to:
        </Typography>
        <ul>
          <li>
            <strong>Practitioners</strong> – medical professionals or healthcare
            providers wishing to be listed, or already listed, on the Website.
          </li>
          <li>
            <strong>End-Users</strong> – patients, their representatives, or
            affiliates searching for Practitioners.
          </li>
          <li>
            <strong>Other Users</strong> – any other person accessing or using
            the Website.
          </li>
        </ul>
        <Typography paragraph>
          The Services covered under these Terms include but are not limited to:
        </Typography>
        <ul>
          <li>
            <strong>For Practitioners:</strong> Listing of profiles,
            credentials, and contact details.
          </li>
          <li>
            <strong>For End-Users:</strong> Creating Health Accounts, searching
            for Practitioners, and booking appointments.
          </li>
        </ul>

        {/* ------------------------- 2 ------------------------- */}
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          2. CONDITIONS OF USE
        </Typography>
        <Typography paragraph>
          Users must be <strong>18 years or older</strong> to access or use the
          Website. By using the Services, you confirm you have the legal right,
          authority, and capacity to enter into this Agreement.
        </Typography>

        {/* ------------------------- 3 ------------------------- */}
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          3. TERMS OF USE – END USERS
        </Typography>
        <Typography paragraph>
          <strong>3.1 Account and Data Privacy:</strong> Arogyaa may collect
          device and usage data to improve Services. Users are responsible for
          maintaining confidentiality of account credentials. Personal data will
          be processed per the Privacy Policy.
        </Typography>
        <Typography paragraph>
          <strong>3.2 Relevance Algorithm:</strong> Practitioner listings are
          generated automatically. Listings do not represent rankings or
          endorsements by Arogyaa.
        </Typography>
        <Typography paragraph>
          <strong>3.3 Information Accuracy:</strong> Arogyaa displays
          Practitioner information but does not guarantee accuracy.
        </Typography>
        <Typography paragraph>
          <strong>3.4 Appointments and Calls:</strong> Arogyaa enables booking
          and teleconsults but is not responsible for cancellations, no-shows,
          or quality of interactions.
        </Typography>
        <Typography paragraph>
          <strong>3.5 No Doctor–Patient Relationship:</strong> Information is
          for general purposes only and does not establish a doctor–patient
          relationship. For emergencies, contact the nearest hospital.
        </Typography>
        <Typography paragraph>
          <strong>3.6 Feedback:</strong> Users may provide feedback. Arogyaa
          reserves the right to moderate or remove any feedback.
        </Typography>

        {/* ------------------------- 4 ------------------------- */}
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          4. TERMS OF USE – PRACTITIONERS
        </Typography>
        <Typography paragraph>
          <strong>4.1 Listing Policy:</strong> Arogyaa collects information for
          Practitioner listings and may modify/remove profiles at its
          discretion.
        </Typography>
        <Typography paragraph>
          <strong>4.2 Profile Ownership and Editing Rights:</strong>{" "}
          Practitioners may update their profile, but Arogyaa reserves final
          moderation rights.
        </Typography>
        <Typography paragraph>
          <strong>4.3 Feedback and Reviews:</strong> End-User feedback may be
          published. Practitioners cannot claim damages from such publication.
        </Typography>
        <Typography paragraph>
          <strong>4.4 Relevance Algorithm:</strong> Visibility is based on
          automated algorithm; no ranking or endorsement implied.
        </Typography>
        <Typography paragraph>
          <strong>4.5 Independent Services:</strong> Practitioners are fully
          responsible for their services and compliance with applicable laws.
        </Typography>
        <Typography paragraph>
          <strong>4.6 Promotional and Marketing Rights:</strong> Arogyaa may use
          Practitioner’s name, logo, and related materials in marketing and
          promotional activities.
        </Typography>

        {/* ------------------------- 5 ------------------------- */}
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          5. RIGHTS AND OBLIGATIONS RELATING TO CONTENT
        </Typography>
        <Typography paragraph>
          Users shall not host, upload, publish, transmit, or share content
          prohibited under law. Arogyaa may remove violating content and
          terminate accounts.
        </Typography>

        {/* ------------------------- 6 ------------------------- */}
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          6. TERMINATION
        </Typography>
        <Typography paragraph>
          Arogyaa may suspend or terminate access to the Website and Services at
          its discretion.
        </Typography>

        {/* ------------------------- 7 ------------------------- */}
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          7. LIMITATION OF LIABILITY
        </Typography>
        <Typography paragraph>
          Arogyaa shall not be liable for any indirect, incidental,
          consequential, or punitive damages arising from use of the Website or
          Services.
        </Typography>

        {/* ------------------------- 8 ------------------------- */}
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          8. RETENTION AND REMOVAL
        </Typography>
        <Typography paragraph>
          Arogyaa may retain user information as required for its operations and
          per applicable laws.
        </Typography>

        {/* ------------------------- 9 ------------------------- */}
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          9. APPLICABLE LAW AND DISPUTE SETTLEMENT
        </Typography>
        <Typography paragraph>
          This Agreement is governed by Indian law. Disputes shall be resolved
          by arbitration as per the Arbitration and Conciliation Act, 1996. The
          seat of arbitration shall be <strong>[City, e.g., Bangalore]</strong>.
        </Typography>

        {/* ------------------------- 10 ------------------------- */}
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          10. CONTACT INFORMATION AND GRIEVANCE OFFICER
        </Typography>
        <Typography paragraph>
          For queries or grievances, contact Arogyaa at{" "}
          <strong>support@Arogyaa.com</strong> or via details on{" "}
          <strong>www.Arogyaa.com/contact</strong>.
        </Typography>

        {/* ------------------------- 11 ------------------------- */}
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          11. SEVERABILITY
        </Typography>
        <Typography paragraph>
          If any provision is unenforceable, the remaining provisions shall
          continue in full force.
        </Typography>

        {/* ------------------------- 12 ------------------------- */}
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>
          12. WAIVER
        </Typography>
        <Typography paragraph>
          No waiver shall be deemed valid unless in writing and signed by
          Arogyaa.
        </Typography>
      </Box>
    </>
  );
}
