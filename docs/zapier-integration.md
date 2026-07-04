# Zapier Integration

How to connect Facebook Lead Ads to Granite Manager using [Zapier](https://zapier.com).

---

## Zap Overview

This Zap captures new Facebook leads and sends them to the Granite Manager webhook as a structured JSON payload.

The workflow consists of two steps:

1. **Facebook Lead Ads** (New Lead) — trigger
2. **Webhooks by Zapier** (POST) — action

---

## Required Payload Fields

The webhook sends a JSON body to the [`POST /v1/webhooks/new-lead-form/{company_id}`](https://docs.granite-manager.com/) endpoint. The full request schema is documented in the [Granite Manager API Reference](https://docs.granite-manager.com/).

When configuring the request body, use the exact field names below. Only **`name`** is required — all other fields are optional but recommended for a complete lead record.

### Required

| Field | Type | Description |
|---|---|---|
| `name` | string | Lead's full name |

### Optional

| Field | Type | Description |
|---|---|---|
| `phone` | string | Contact phone number |
| `email` | string | Contact email address |
| `address` | string | Street address |
| `city` | string | City |
| `postal_code` | string | ZIP / postal code |
| `details` | string | Additional project notes or form answers |
| `referral_source` | string | Where the lead came from (e.g. `facebook`) |
| `compaign_name` | string | Facebook campaign name |
| `adset_name` | string | Facebook ad set name |
| `ad_name` | string | Facebook ad name |
| `start_date` | string | When the client plans to start the project |
| `project_size` | string | Estimated project size |
| `remodel_type` | string | Type of remodel |
| `backsplash` | string | Backsplash preference |
| `sink` | string | Sink preference |
| `stove_type` | string | Stove type |
| `tear_out` | string | Tear-out details |
| `contact_time` | string | Preferred contact time |
| `improve_offer` | string | Offer improvement response |
| `your_message` | string | Free-text message from the lead |
| `file` | string | Attached file reference |

> **Tip:** Map as many optional fields as your Facebook Lead Form collects. Fields you leave empty are sent as `null` and ignored by the API.

---

## 1. Trigger: Facebook Lead Ads (New Lead)

**Action:** Connect your Facebook Business Account.

**Configuration:** Select the specific Facebook Page and the Lead Generation Form you want to track.

**Result:** The Zap triggers instantly every time a prospective client submits a new lead form.

---

## 2. Action: Webhooks by Zapier (POST)

Follow these steps to securely send your lead data to the CRM.

### Step 1: Add the Action

In your Zap editor, click **+** to add an action step. Search for **Webhooks by Zapier** and select **POST**.

### Part 1: Connection & Endpoint Setup

**Method:** Select **POST**.

**URL:** Input the following endpoint path exactly:

`https://cawv6iwjgxpk5fj2fchs6vc5vq0bycwp.lambda-url.us-east-2.on.aws/v1/webhooks/new-lead-form/{company_id}`

> **Company ID:** Manually replace `{company_id}` with your actual organization ID. Ask your company administrator for your Company ID — you can find it in **Admin → Company Settings → Company** within Granite Manager.
>
> <img src="https://granite-database.s3.us-east-2.amazonaws.com/static-images/16be145e-f48c-44f8-abfd-13ef268b63f2.jpg" alt="Company ID location in Admin Settings" width="423" />

**Data Pass-Through?** Select **No**.

**Unflatten:** Select **No**.

### Part 2: Headers & Authentication

Click **Show options** to expand additional fields, then add a header:

| Name | Value |
|---|---|
| `Authorization` | `Bearer YOUR_API_TOKEN` |

> **API Token:** Replace `YOUR_API_TOKEN` with the secret security token requested directly from the Granite Manager company.

### Part 3: Body & Field Mapping

**Payload Type:** Select **Json**.

Under **Data**, add a row for each field from the [Required Payload Fields](#required-payload-fields) section. Map Facebook Lead Ads values from the trigger step, or enter static text where noted:

| API field | Map from Facebook |
|---|---|
| `name` *(required)* | Full name |
| `phone` | Phone number |
| `email` | Email |
| `city` | City |
| `postal_code` | Zip code |
| `details` | Project notes / form answers (combine multiple fields if needed) |
| `compaign_name` | Campaign name |
| `adset_name` | Adset name |
| `ad_name` | Ad name |
| `start_date` | When are you planning to start the project? |
| `referral_source` | Type `facebook` as a static value |

- **Dynamic fields:** Click each value field and select the corresponding token from the Facebook Lead Ads trigger (e.g., contact details, project notes, campaign names).
- **Static fields:** For fields that need the same value on every lead (such as `referral_source`), type the plain text directly (e.g., `facebook`).

**Wrap Request In Array:** Leave **No**.

### Part 4: Test & Publish

Click **Continue**, then **Test step** to send a sample lead to the webhook.

If the test returns a `201` response, click **Publish** to turn on the Zap.

**Result:** Sends the structured lead data directly into your CRM database webhook.
