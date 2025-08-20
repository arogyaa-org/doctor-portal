import { Box, Typography, Divider, Link } from "@mui/material";

export const metadata = {
  title: "Privacy Policy | Arogyaa",
  description: "How Arogyaa collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <Box>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Privacy Policy
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Last updated: Aug 18, 2025 · Version: privacy@1.0.0
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* INTRO */}
      <Typography paragraph>
        Arogyaa Health Technologies Private Limited (“us”, “we”, or “Arogyaa”,
        which also includes its affiliates) is the author and publisher of the
        internet resource{" "}
        <Link
          href="https://www.Arogyaapatient.com"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          www.Arogyaapatient.com
        </Link>{" "}
        (“Website”) as well as the software, services and applications provided
        by Arogyaa, including but not limited to the mobile application ‘Arogyaa
        Health’, and the software, services and applications of the brand names
        ‘Arogyaa Ray’, ‘Arogyaa Tab’, ‘Arogyaa Reach’, ‘Hello’, ‘Assured’ and
        ‘Health Account’ (together with the Website, referred to as the
        “Services”).
      </Typography>

      <Typography paragraph>
        This privacy policy ("Privacy Policy") explains how we collect, use,
        share, disclose and protect personal information about the Users of the
        Services, including the Practitioners (as defined in the Terms of Use),
        the End-Users, and the visitors of Website (jointly and severally
        referred to as “you” or “Users” in this Privacy Policy). We created this
        Privacy Policy to demonstrate our commitment to the protection of your
        privacy and your personal information. Your use of and access to the
        Services is subject to this Privacy Policy and our Terms of Use. Any
        capitalized term used but not defined in this Privacy Policy shall have
        the meaning attributed to it in our Terms of Use.
      </Typography>

      <Typography paragraph fontWeight={700}>
        BY USING THE SERVICES OR BY OTHERWISE GIVING US YOUR INFORMATION, YOU
        WILL BE DEEMED TO HAVE READ, UNDERSTOOD AND AGREED TO THE PRACTICES AND
        POLICIES OUTLINED IN THIS PRIVACY POLICY AND AGREE TO BE BOUND BY THE
        PRIVACY POLICY.
      </Typography>

      <Typography paragraph>
        YOU HEREBY CONSENT TO OUR COLLECTION, USE, AND DISCLOSURE OF YOUR
        INFORMATION AS DESCRIBED IN THIS PRIVACY POLICY. WE RESERVE THE RIGHT TO
        CHANGE, MODIFY, ADD OR DELETE PORTIONS OF THE TERMS OF THIS PRIVACY
        POLICY, AT OUR SOLE DISCRETION, AT ANY TIME. IF YOU DO NOT AGREE WITH
        THIS PRIVACY POLICY AT ANY TIME, DO NOT USE ANY OF THE SERVICES OR GIVE
        US ANY OF YOUR INFORMATION. IF YOU USE THE SERVICES ON BEHALF OF SOMEONE
        ELSE (SUCH AS YOUR CHILD) OR AN ENTITY (SUCH AS YOUR EMPLOYER), YOU
        REPRESENT THAT YOU ARE AUTHORISED BY SUCH INDIVIDUAL OR ENTITY TO (I)
        ACCEPT THIS PRIVACY POLICY ON SUCH INDIVIDUAL’S OR ENTITY’S BEHALF, AND
        (II) CONSENT ON BEHALF OF SUCH INDIVIDUAL OR ENTITY TO OUR COLLECTION,
        USE AND DISCLOSURE OF SUCH INDIVIDUAL’S OR ENTITY’S INFORMATION AS
        DESCRIBED IN THIS PRIVACY POLICY.
      </Typography>

      {/* 1. WHY THIS PRIVACY POLICY? */}
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
        1. WHY THIS PRIVACY POLICY?
      </Typography>

      <Typography component="div" sx={{ mb: 2, lineHeight: 1.8 }}>
        This Privacy Policy is published in compliance with:
        <Box component="ul" sx={{ pl: 3, mt: 0.5 }}>
          <li>Section 43A of the Information Technology Act, 2000;</li>
          <li>
            Regulation 4 of the Information Technology (Reasonable Security
            Practices and Procedures and Sensitive Personal Information) Rules,
            2011 (the “SPI Rules”);
          </li>
          <li>
            Regulation 3(1) of the Information Technology (Intermediaries
            Guidelines) Rules, 2011.
          </li>
        </Box>
      </Typography>

      <Typography component="div" sx={{ mb: 2, lineHeight: 1.8 }}>
        This Privacy Policy states the following:
        <Box component="ul" sx={{ pl: 3, mt: 0.5 }}>
          <li>
            The type of information collected from the Users, including Personal
            Information and Sensitive Personal Data or Information relating to
            an individual;
          </li>
          <li>
            The purpose, means and modes of collection, usage, processing,
            retention and destruction of such information; and
          </li>
          <li>How and to whom Arogyaa will disclose such information.</li>
        </Box>
      </Typography>

      {/* 2. COLLECTION OF PERSONAL INFORMATION */}
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
        2. COLLECTION OF PERSONAL INFORMATION
      </Typography>

      <Typography paragraph>
        When you access the Services, or through any interaction with us via
        emails, telephone calls or other correspondence, we may ask you to
        voluntarily provide us with certain information that personally
        identifies you or could be used to personally identify you. You hereby
        consent to the collection of such information by Arogyaa.
      </Typography>

      <Typography component="div" sx={{ lineHeight: 1.8 }}>
        Information collected by us may include but is not limited to:
        <Box component="ul" sx={{ pl: 3, mt: 0.5 }}>
          <li>Contact data (such as your email address and phone number);</li>
          <li>
            Demographic data (such as your gender, date of birth, and pin code);
          </li>
          <li>
            Data regarding your usage of the services and history of
            appointments;
          </li>
          <li>Insurance data (such as your insurance carrier and plan);</li>
          <li>
            Other information voluntarily provided by you including images and
            documents;
          </li>
          <li>
            Data shared by the Practitioners pertaining to the treatment availed
            by you.
          </li>
        </Box>
      </Typography>

      <Typography paragraph>
        “Personal Information” means any information that relates to a natural
        person which, either directly or indirectly, is capable of identifying
        such person.
      </Typography>

      <Typography component="div" sx={{ lineHeight: 1.8, mb: 2 }}>
        “Sensitive Personal Data or Information” includes:
        <Box component="ul" sx={{ pl: 3, mt: 0.5 }}>
          <li>Passwords;</li>
          <li>
            Financial information such as bank accounts or payment details;
          </li>
          <li>Physical, physiological and mental health conditions;</li>
          <li>Sexual orientation;</li>
          <li>Medical records and history;</li>
          <li>Biometric information;</li>
          <li>
            Any detail relating to the above clauses as provided to body
            corporate for providing service;
          </li>
          <li>Any information received under lawful contract.</li>
        </Box>
      </Typography>

      <Typography paragraph>
        Arogyaa will be free to use, collect and disclose information that is
        freely available in the public domain without your consent.
      </Typography>

      {/* 3. PRIVACY STATEMENTS */}
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
        3. PRIVACY STATEMENTS
      </Typography>

      {/* 3.1 ALL USERS NOTE */}
      <Typography
        variant="subtitle1"
        fontWeight={700}
        gutterBottom
        sx={{ mt: 2 }}
      >
        3.1 ALL USERS NOTE:
      </Typography>

      <Typography paragraph>
        3.1.1 A condition of each User’s use of and access to the Services is
        their acceptance of the Terms of Use, which also involves acceptance of
        the terms of this Privacy Policy. Any User that does not agree with any
        provisions of the same has the option to discontinue the Services
        provided by Arogyaa immediately.
      </Typography>

      <Typography paragraph>
        3.1.2 An indicative list of information that Arogyaa may require you to
        provide to enable your use of the Services is provided in the Schedule
        annexed to this Privacy Policy.
      </Typography>

      <Typography component="div" sx={{ lineHeight: 1.8, mb: 2 }}>
        3.1.3 All the information provided to Arogyaa by a User, including
        Personal Information or any Sensitive Personal Data or Information, is
        voluntary. You understand that Arogyaa may use certain information of
        yours, which has been designated as Personal Information or ‘Sensitive
        Personal Data or Information’ under the SPI Rules, for the following
        purposes:
        <Box component="ol" sx={{ pl: 3, mt: 0.5 }}>
          <li>For providing you the Services,</li>
          <li>
            For commercial purposes in an aggregated or non-personally
            identifiable form for research, statistical analysis, and business
            intelligence purposes,
          </li>
          <li>
            For sale or transfer of such research, statistical or intelligence
            data in an aggregated or non-personally identifiable form to third
            parties and affiliates,
          </li>
          <li>
            For communication purposes to provide you a better way of booking
            appointments and for obtaining feedback,
          </li>
          <li>Debugging customer support related issues,</li>
          <li>
            Contacting you to complete any transaction if you do not complete it
            after providing contact information.
          </li>
        </Box>
      </Typography>

      <Typography component="div" sx={{ lineHeight: 1.8 }}>
        Arogyaa also reserves the right to use information provided by or about
        the End-User for purposes including:
        <Box component="ul" sx={{ pl: 3, mt: 0.5 }}>
          <li>Identifying you.</li>
          <li>Publishing such information on the Website.</li>
          <li>Contacting End-Users for offering new products or services.</li>
          <li>Contacting End-Users for feedback.</li>
          <li>
            Analyzing usage patterns for improving product design and utility.
          </li>
          <li>Analyzing anonymized practice information for commercial use.</li>
          <li>Processing payment instructions via third parties.</li>
        </Box>
      </Typography>

      <Typography paragraph>
        By accessing and using the Website and/or verifying your contact number
        with Arogyaa, you have explicitly consented to receive all above-stated
        communications (via call, SMS, email, or other electronic means) from
        Arogyaa and/or its authorized representatives, even if your contact
        number is on a DND/NCPR list.
      </Typography>

      <Typography paragraph>
        3.1.4 Collection, use, and disclosure of information designated as
        Personal Information or Sensitive Personal Data or Information under SPI
        Rules requires your express consent. By affirming your assent to this
        Privacy Policy, you provide such consent.
      </Typography>

      <Typography paragraph>
        3.1.5 Arogyaa does not control or endorse content, messages, or
        information found in any Services and, therefore, specifically disclaims
        liability with regard to the Services and any actions resulting from
        your participation in such Services.
      </Typography>

      <Typography paragraph>
        3.1.6 You are responsible for maintaining the accuracy of information
        you submit. You may correct or amend information by logging into your
        account or contacting{" "}
        <Link href="mailto:privacy@Arogyaahealth.com">
          privacy@Arogyaapatient.com.
        </Link>
        . If you provide any information that is untrue or outdated, or Arogyaa
        has reasonable grounds to suspect so, Arogyaa may discontinue your
        Services.
      </Typography>

      <Typography paragraph>
        3.1.7 If you wish to cancel your account or request that we no longer
        use your information, please email{" "}
        <Link href="mailto:support@Arogyaapatient.com">
          support@Arogyaapatient.com
        </Link>
        . We will retain your information as long as your account is active and
        as needed to provide Services, or as required by law. After a period,
        your data may be anonymized and aggregated for analytics.
      </Typography>

      <Typography paragraph>
        3.1.8 To opt out of promotional communications, email{" "}
        <Link href="mailto:support@Arogyaapatient.com">
          support@Arogyaapatient.com
        </Link>
        .
      </Typography>

      <Typography paragraph>
        3.1.9 Arogyaa may require payment via credit card, debit card, or other
        modes. Arogyaa uses secure payment gateways and encryption for payment
        transactions.
      </Typography>

      <Typography paragraph>
        3.1.10 Arogyaa may collect information such as IP address, browser type,
        and usage trends for system administration and to improve Services.
      </Typography>

      <Typography paragraph>
        3.1.11 The Website uses temporary cookies. Cookies do not contain
        Personal Information. You may disable cookies in your browser; however,
        some features of the Website may be limited.
      </Typography>

      <Typography paragraph>
        3.1.12 Users may access the Website without registering but need to
        provide information like name and phone number to book appointments.
      </Typography>

      <Typography paragraph>
        3.1.13 Arogyaa does not control third-party websites and is not
        responsible for their privacy practices.
      </Typography>

      <Typography paragraph>
        3.1.14 Users communicating through the Website should be cautious as
        other users may collect data. Arogyaa disclaims liability for reliance
        on such information.
      </Typography>

      <Typography paragraph>
        3.1.15 Arogyaa does not collect information from other sources except as
        required for registration.
      </Typography>

      <Typography paragraph>
        3.1.16 Arogyaa has a strict "No-Spam" policy and does not sell or rent
        your email address without your consent.
      </Typography>

      <Typography paragraph>
        3.1.17 Arogyaa implements security policies and practices to protect
        personal data but is not liable for data loss due to unauthorized access
        to your devices.
      </Typography>

      <Typography paragraph>
        3.1.18 Arogyaa takes your privacy seriously and will only disclose your
        information if required by law or to protect rights or prevent harm.
      </Typography>

      {/* 3.2 PRACTITIONERS NOTE */}
      <Typography
        variant="subtitle1"
        fontWeight={700}
        gutterBottom
        sx={{ mt: 2 }}
      >
        3.2 PRACTITIONERS NOTE
      </Typography>

      <Typography paragraph>
        3.2.1 As part of the registration, application creation, and submission
        process available to Practitioners on Arogyaa, certain information,
        including Personal Information or Sensitive Personal Data or Information
        is collected from the Practitioners.
      </Typography>

      <Typography paragraph>
        3.2.2 All statements in this Privacy Policy apply to all Practitioners,
        and all Practitioners are required to read and understand these privacy
        statements prior to submitting any Personal Information or Sensitive
        Personal Data or Information to Arogyaa, failing which they must leave
        the Services immediately.
      </Typography>

      <Typography paragraph>
        3.2.3 Practitioners’ personally identifiable information, which they
        choose to provide to Arogyaa, is used to help describe and identify
        themselves. This information is exclusively owned by Arogyaa. You will
        be the owner of your information, and you consent to Arogyaa collecting,
        using, processing and/or disclosing this information for the purposes
        stated herein.
      </Typography>

      {/* ===== Continue from here with 3.2.4 ... when you send the next chunk ===== */}

      {/* ===== Continue Privacy Policy ===== */}

      <Typography paragraph>
        Arogyaa may use such information in aggregated or non-personally
        identifiable form for research, statistical analysis, business
        intelligence purposes, and may sell or transfer such research data to
        third parties and affiliates. Arogyaa also reserves the right to use
        information provided for:
      </Typography>

      <ul style={{ paddingLeft: "1.5rem" }}>
        <li>Publishing on the Website.</li>
        <li>Contacting Practitioners for offering new products or services.</li>
        <li>Taking product feedback.</li>
        <li>
          Analyzing software usage patterns to improve product design and
          utility.
        </li>
        <li>Analyzing anonymized practice information for commercial use.</li>
      </ul>

      <Typography variant="h6" gutterBottom fontWeight={700}>
        3.2.4
      </Typography>
      <Typography paragraph>
        Arogyaa automatically enables listing of Practitioners' information on
        its Website for every “Doctor” or “Clinic” added to a practice using its
        software. This information is displayed when End-Users search for
        Practitioners and is used to request appointments. Information listed is
        not generated by Arogyaa but is provided by Practitioners or collected
        from public domain. Arogyaa displays it on an as-is basis and encourages
        Practitioners to regularly check accuracy and inform Arogyaa of any
        changes.
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={700}>
        3.2.5
      </Typography>
      <Typography paragraph>
        Arogyaa may also display information for Practitioners who have not
        signed up, provided they have consented to Arogyaa collecting and
        disclosing their information on the Website. Such information is
        verified, but Arogyaa does not undertake liability for inaccuracies.
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={700}>
        3.3 END-USERS NOTE
      </Typography>
      <Typography paragraph>
        During registration or appointment creation, certain information
        including Personal Information or Sensitive Personal Data or Information
        is collected from End-Users.
      </Typography>

      <Typography paragraph>
        All statements in this Privacy Policy apply to End-Users, and End-Users
        must read and understand these before submitting any data, failing which
        they must leave Arogyaa immediately.
      </Typography>

      <Typography paragraph>
        If you inadvertently submitted information before reading these privacy
        statements and do not agree with the collection or usage, you may modify
        or delete your data using account options or by emailing
        <Link
          href="mailto:privacy@Arogyaahealth.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}
          privacy@Arogyaapatient.com.
        </Link>
        . You may also inquire about your data held by Arogyaa and request
        deletion.
      </Typography>

      <Typography paragraph>
        End-Users’ personally identifiable information helps describe/identify
        themselves. Other non-personal information is owned by Arogyaa and may
        be used in aggregated form for research, analytics, and business
        intelligence, and may be shared or sold in anonymized form. Arogyaa
        reserves the right to use anonymized demographic and health information
        for:
      </Typography>

      <ul style={{ paddingLeft: "1.5rem" }}>
        <li>Analyzing usage patterns to improve products.</li>
        <li>Research and development.</li>
        <li>Use in commercial product offerings.</li>
        <li>Sharing with third parties for commercial use.</li>
      </ul>

      <Typography paragraph>
        Arogyaa may communicate via email, phone, notices on the Website, or
        other means. End-Users can change contact preferences through their
        account settings.
      </Typography>

      <Typography paragraph>
        Arogyaa may conduct user surveys to collect preferences. Participation
        is optional and responses kept anonymous. Arogyaa may also run contests
        and collect contact info for eligibility and notification.
      </Typography>

      <Typography paragraph>
        End-Users using services from Practitioners with the “Assured” badge
        consent to treatment data, including medical records, being shared with
        Arogyaa to provide Services effectively.
      </Typography>

      <Typography paragraph>
        Arogyaa may keep records of communications and calls for administration,
        support, research, and better listing of Practitioners.
      </Typography>

      <Typography paragraph>
        Arogyaa’s employees and data processors who access sensitive data are
        obligated to maintain confidentiality. Adequate security measures and
        procedures as per laws and good industry practices are in place.
      </Typography>

      <Typography paragraph>
        Arogyaa may disclose or transfer End-User data as part of any
        reorganization or sale of business assets. The new entity will have the
        right to continue using the data.
      </Typography>

      <Typography paragraph>
        Arogyaa may share personal data with contractors or service providers
        solely to enable provision of Services. Such third parties are
        restricted from using the data for other purposes.
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={700}>
        3.4 CASUAL VISITORS NOTE
      </Typography>
      <Typography paragraph>
        No sensitive personal data is automatically collected from casual
        visitors who are merely browsing the Website.
      </Typography>

      <Typography paragraph>
        Certain provisions of this Privacy Policy apply to casual visitors as
        well. If visitors do not agree, they should exit the Website
        immediately.
      </Typography>

      <Typography paragraph>
        If you inadvertently browsed before reading these terms and disagree,
        quitting the browser usually clears temporary cookies. Visitors are
        encouraged to use their browser’s “clear cookies” function for added
        assurance.
      </Typography>

      <Typography paragraph>
        You are not a casual visitor if you have willingly submitted personal
        data via email, post, or Website registration. In that case, all Privacy
        Policy statements apply to you.
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={700}>
        4. CONFIDENTIALITY AND SECURITY
      </Typography>
      <Typography paragraph>
        Your Personal Information is maintained by Arogyaa in electronic form on
        its equipment and on the equipment of its employees. Information may
        also be converted to physical form from time to time. Arogyaa takes
        necessary precautions to protect your information both online and
        offline and implements reasonable security practices including
        managerial, technical, operational, and physical security control
        measures that are commensurate with the nature of its business.
      </Typography>

      <Typography paragraph>
        No administrator at Arogyaa will have knowledge of your password. It is
        important for you to protect against unauthorized access to your
        password, computer, and mobile phone. Be sure to log off after using a
        shared computer. Arogyaa is not liable for any unauthorized use of your
        account and password. If you suspect misuse, you must immediately notify
        Arogyaa at{" "}
        <Link
          href="mailto:support@Arogyaapatient.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          support@Arogyaapatient.com
        </Link>
        . You will be liable to indemnify Arogyaa for any loss suffered due to
        such unauthorized use.
      </Typography>

      <Typography paragraph>
        Arogyaa makes user information accessible to its employees, agents, or
        partners and third parties only on a need-to-know basis and binds them
        to strict confidentiality obligations.
      </Typography>

      <Typography paragraph>
        Part of Arogyaa's functionality is to assist doctors in maintaining and
        organizing records. Arogyaa may retain and submit such records to
        appropriate authorities or doctors who request access.
      </Typography>

      <Typography paragraph>
        Arogyaa also helps patients access their records. Arogyaa may retain and
        submit these records to patients or their doctors.
      </Typography>

      <Typography paragraph>
        Notwithstanding the above, Arogyaa is not responsible for the
        confidentiality, security, or distribution of your Personal Information
        by partners and third parties outside the scope of Arogyaa's agreements.
        Arogyaa is also not responsible for any breach of security or actions of
        third parties beyond its control, including but not limited to acts of
        government, hacking, unauthorized access, device crashes, poor internet
        or telephone service quality.
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={700}>
        5. CHANGE TO PRIVACY POLICY
      </Typography>
      <Typography paragraph>
        Arogyaa may update this Privacy Policy at any time, with or without
        advance notice. In case of significant changes, Arogyaa will post a
        notice on the Website or send you an email so that you may review the
        new terms.
      </Typography>
      <Typography paragraph>
        If you object to any changes and no longer wish to use the Services, you
        may contact{" "}
        <Link
          href="mailto:support@Arogyaapatient.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          support@Arogyaapatient.com
        </Link>{" "}
        to deactivate your account. Unless stated otherwise, Arogyaa’s current
        Privacy Policy applies to all information it has about you and your
        account.
      </Typography>
      <Typography paragraph>
        If you use the Services after a notice of changes has been sent or
        published, you provide consent to the updated terms.
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={700}>
        6. CHILDREN'S AND MINOR'S PRIVACY
      </Typography>
      <Typography paragraph>
        Arogyaa encourages parents and guardians to supervise the online
        activities of minors and consider parental control tools to help provide
        a child-friendly online environment. Although Arogyaa's Website and
        Services are not intended for use by minors, Arogyaa respects the
        privacy of minors who may inadvertently use the internet or mobile
        application.
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={700}>
        7. CONSENT TO THIS POLICY
      </Typography>
      <Typography paragraph>
        You acknowledge that this Privacy Policy is part of the Terms of Use and
        you unconditionally agree that becoming a User signifies your assent to
        this Privacy Policy and consent to Arogyaa using, collecting,
        processing, and/or disclosing your information as described herein. Your
        use of the Website and Services is subject to this Privacy Policy and
        Terms of Use.
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={700}>
        8. ADDRESS FOR PRIVACY QUESTIONS
      </Typography>
      <Typography paragraph>
        If you have questions about this Privacy Policy or Arogyaa’s information
        practices, you may contact the Data Protection Officer appointed by
        Arogyaa. We will use reasonable efforts to respond promptly to requests,
        questions, or concerns.
      </Typography>

      <Typography paragraph>
        If you have a grievance regarding our use of your information, you may
        communicate it to:
      </Typography>

      <Typography paragraph>
        <strong>Data Protection Officer</strong> <br />
        Name: [To be appointed] <br />
        Arogyaa Health Technologies Pvt Ltd <br />
        Noida, Uttar Pradesh, India. <br />
        Email:{" "}
        <Link
          href="mailto:privacy@Arogyaahealth.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          privacy@Arogyaapatient.com.
        </Link>
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={700}>
        SCHEDULE — Indicative List of Information by Nature of Service
      </Typography>

      <ul style={{ paddingLeft: "1.5rem" }}>
        <li>
          <strong>End-Users registering for an account:</strong> You provide
          [name, mobile number, email address], and other information requested
          to book appointments and store health data.
        </li>
        <li>
          <strong>End-Users without registering (Guest):</strong> You provide
          [mobile number] and other information needed to book appointments.
        </li>
        <li>
          <strong>Practitioner with account:</strong> Provide [name, mobile
          number, email address], and other information. Arogyaa may send
          confirmations or communications in connection with bookings.
        </li>
        <li>
          <strong>Practitioner without account (listed by Arogyaa):</strong>{" "}
          Provide [name, mobile number, email address], and other information
          gathered by Arogyaa employees or from the public domain. Arogyaa may
          contact to confirm listing.
        </li>
        <li>
          <strong>Practitioners using ‘Ray’ and/or ‘Tab’:</strong> Provide
          [name, mobile number, email address, digital signature], and other
          requested information. Digital signatures are used for prescriptions
          and notes.
        </li>
        <li>
          <strong>Practitioners using ‘Arogyaa Reach’:</strong> Provide [name,
          mobile number, email address], and other information to register.
        </li>
        <li>
          <strong>End-Users and Practitioners using Consult:</strong> Provide
          [name, mobile number, email address], and other requested information
          to register.
        </li>
        <li>
          <strong>End-Users availing “Assured” services:</strong> Consent to
          share treatment and medical records with Arogyaa for providing
          services effectively.
        </li>
      </ul>
    </Box>
  );
}
