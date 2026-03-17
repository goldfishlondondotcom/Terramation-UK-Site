# Brevo Ad Sales Setup

Use this as the setup checklist for advertising outreach and advertiser enquiries.

## Lists

Create these lists in Brevo:

- `Ad Prospects - Corporate`
- `Ad Prospects - Manual Review`
- `Advertisers - Warm`
- `Advertisers - Live`
- `Advertisers - Do Not Contact`

## Contact attributes

Create these custom attributes:

- `COMPANY`
- `CATEGORY`
- `COUNTY`
- `CONTACT_ROLE`
- `SUBSCRIBER_TYPE`
- `SOURCE_URL`
- `AD_STATUS`
- `NEXT_FOLLOW_UP`
- `LAST_OUTREACH_STAGE`

Suggested values:

- `SUBSCRIBER_TYPE`: `corporate`, `sole_trader`, `unknown`
- `AD_STATUS`: `lead_found`, `qualified`, `contacted`, `interested`, `proposal_sent`, `won`, `not_now`, `do_not_contact`

## Segments

Create segments for:

- `Corporate prospects ready for outreach`
  Rule: in `Ad Prospects - Corporate` and `AD_STATUS = qualified`

- `Warm advertisers`
  Rule: in `Advertisers - Warm`

- `Needs follow-up today`
  Rule: `NEXT_FOLLOW_UP = today` or overdue

## Automation workflow

Suggested workflow for corporate B2B prospects:

1. Trigger: contact added to `Ad Prospects - Corporate`
2. Wait: 1 day
3. Send: Outreach email 1
4. Wait: 4 days
5. Send: Outreach email 2
6. Wait: 7 days
7. Send: Outreach email 3

If contact clicks a key link:

- move to `Advertisers - Warm`
- update `AD_STATUS` to `interested`

If contact replies or submits the advertising form:

- update `AD_STATUS` to `interested`
- remove from prospect workflow
- move to `Advertisers - Warm`

If contact objects:

- set `AD_STATUS` to `do_not_contact`
- move to `Advertisers - Do Not Contact`

## Compliance notes

- Use caution with sole traders and unclear business contacts.
- Keep source URLs for every lead.
- Include a simple opt-out line in every outreach email.
- Stop immediately if someone objects to direct marketing.
