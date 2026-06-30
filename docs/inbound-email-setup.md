# Inbound Email Setup

Please follow these exact steps to add the required DNS verification records to the domain registrar and configure the master email routing rules inside Google Admin.

## Part 1: Add DNS Records to the Domain Registrar

Log into the company account where the domain was purchased (e.g., GoDaddy, Namecheap, Squarespace) and open the DNS Management / Zone Editor to add these 5 records:

### DKIM Record 1

- Type: CNAME
- Name/Host: `[Paste DKIM Name 1 String]`
- Value/Target: `[Paste DKIM Value 1 String]`

### DKIM Record 2

- Type: CNAME
- Name/Host: `[Paste DKIM Name 2 String]`
- Value/Target: `[Paste DKIM Value 2 String]`

### DKIM Record 3

- Type: CNAME
- Name/Host: `[Paste DKIM Name 3 String]`
- Value/Target: `[Paste DKIM Value 3 String]`

### MAIL FROM MX Record

- Type: MX
- Name/Host: `mail`
- Priority: `10`
- Value/Target: `[Paste Inbound SMTP Server String]`

### MAIL FROM TXT Record

- Type: TXT
- Name/Host: `mail`
- Value/Target: `[Paste SPF/TXT Configuration String]`

## Part 2: Create SMTP Route Host in Google Admin

Before configuring the routing rule, create the destination route that Amazon SES messages will be delivered through:

1. Log into the [Google Admin Console](https://admin.google.com) using an Administrator account.

2. In the left navigation menu, go to **Apps** > **Google Workspace** > **Gmail**.

3. Scroll down and click on **Hosts**.

4. Click **Add Route**.

5. Configure the host with the following settings:

   - **Name:** `Amazon SES - {Your Company}`
   - **Specify email server:** `inbound-smtp.us-east-2.amazonaws.com`
   - **Port:** `25`
   - Check **Require mail to be transmitted over a secure TLS connection**
   - Check **Require CA signed certificate**
   - Check **Validate certificate**
   - Check **Validate hostname**

   <img src="/inbound-email-host-settings.png" alt="Amazon SES SMTP route host configuration with name, server, port, and TLS settings" width="415">

6. Click **SAVE**.

## Part 3: Configure Domain-Wide Routing in Google Admin

To route the email traffic streams directly to the database while keeping normal inbox delivery intact:

1. Log into the [Google Admin Console](https://admin.google.com) using an Administrator account.

2. In the left navigation menu, go to **Apps** > **Google Workspace** > **Gmail**.

3. Scroll down to the bottom of the page and click on **Routing**.

4. Click **Configure** (or **Add Another Rule** if rules already exist).

5. In the Edit setting window, configure the settings as follows:

   **Name:** `Amazon SES - Granite Manager`

   **1. Email messages to affect:**
   - Check **Inbound**
   - Check **Internal - Receiving**

   **2. For the above types of messages, do the following:**
   - Set the dropdown to **Modify message**.
   - Under *Select all account types this action should apply to*, check **Active user accounts** and check **All inactive and unrecognized accounts**.

   <img src="/inbound-email-routing-screenshot.png" alt="Routing rule configuration showing Inbound and Internal - Receiving checkboxes" width="415">

   **Also deliver to** section (scroll down further):
   - Check the box for **Add more recipients**.
   - Click the **ADD** button next to the list.
   - Click **Advanced** (switch from Basic to Advanced view).
   - Select your target email inbound path or route (e.g., *Use route: Amazon SES - {Your Company}*).
   - Ensure **Do not deliver spam to this recipient** and **Suppress bounces from this recipient** are checked.

   <img src="/inbound-email-deliver-to.png" alt="Also deliver to section with Amazon SES route and delivery options" width="412">

6. Click **SAVE** at the bottom right of the rule panel, then click **Save** on the main Gmail settings page to apply the changes domain-wide.
