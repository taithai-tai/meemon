# Meemon Commerce setup

> Never paste a Supabase personal access token, database password, service-role
> key, EasySlip key, Turnstile secret, or administrator password into source code,
> an issue, a commit, or a chat. Revoke any credential that has been exposed.

The checked-in website contains no backend secret. The production Supabase
project, EasySlip provider, and Turnstile widget are already connected. New
orders remain disabled only while the receiving bank account is waiting for its
required real test-slip validation.

## 1. Create and migrate Supabase

1. Create a Supabase project in the production region you intend to keep.
2. Link this repository with the Supabase CLI.
3. Apply every migration in `supabase/migrations/` in filename order.
4. Copy `supabase/.env.example` to a private local environment file and fill the values. Never commit that file.
5. Set Edge Function secrets for `EASYSLIP_API_KEY`, `TURNSTILE_SECRET_KEY`, `RATE_LIMIT_SALT`, `MAINTENANCE_SECRET`, and the Supabase service credentials.
6. Deploy `checkout`, `admin`, and `maintenance`. Keep JWT verification enabled for `admin` and `maintenance`; only `checkout` is public and it enforces origin, Turnstile, rate limits, token hashing, and server-side pricing.

## Automatic website deployment from GitHub

The repository includes `.github/workflows/deploy.yml`. A push to `main` tests
the data, builds the V2 site, verifies all legacy and V2 route contracts, and
publishes GitHub Pages. The public Supabase URL, publishable key, and Turnstile
site key are included as browser configuration, so no GitHub secret is required
for the website build.

Database migrations and Edge Functions are intentionally not redeployed by the
public website workflow. Their production secrets live only in Supabase. When
backend source changes, deploy it separately with a fresh Supabase access token
and database password from a trusted machine.

The scheduled maintenance workflow still needs these encrypted repository
secrets under **Settings → Secrets and variables → Actions**:

- `SUPABASE_SERVICE_ROLE_KEY`: the private legacy `service_role` JWT. It is used
  only by scheduled maintenance, never by the website.
- `MAINTENANCE_SECRET`: a different new long random value.

`EASYSLIP_API_KEY`, `TURNSTILE_SECRET_KEY`, and `RATE_LIMIT_SALT` are stored
directly as Supabase Edge Function secrets. They are not copied into GitHub.

GitHub's scheduled workflow calls maintenance every five minutes, which expires
unpaid orders, retries delayed bank responses, and removes old private slips.
The website deployment verifies all route and build checks before publishing.

## 2. Import catalog and create the first admin

Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_BOOTSTRAP_PASSWORD` in your terminal, then run:

```sh
node scripts/setup-supabase-commerce.mjs
```

This imports 45 products and their option combinations. Products with a price range start as `needs_pricing`; set every SKU price in the admin before opening them for sale. It creates or updates the single username `admin` with the supplied password. The password is never stored in this repository.

## 3. Validate the receiving account

The initial KBank account is inserted as `pending_validation`, never active. In `/v2/admin`, first register the same receiver account in the EasySlip branch, then upload a real low-value test transfer with its exact amount. Only a successful EasySlip account, amount, and duplicate check activates the account.

Changing the receiver follows the same process. Activation is blocked while any order is `pending_payment` or `verifying`; previous orders retain their original account snapshot.

## 4. Build the static website

Run the build directly; production public browser values already have safe
defaults and can be overridden with the three `NEXT_PUBLIC_` variables shown in
`v2/_source/.env.example`. Do not put service-role, EasySlip, Turnstile secret,
or admin passwords in any `NEXT_PUBLIC_` variable.

## 5. Schedule maintenance

The included GitHub workflow invokes the JWT-protected `maintenance` Edge
Function every five minutes with a service authorization token and
`x-maintenance-secret`. If you later move maintenance to a dedicated scheduler,
it can run every minute. It expires unpaid orders, retries delayed bank
responses, and removes private slip images after 30 days.

Before accepting production money, run a staging transfer, verify store identity/contact details, and publish shipping, refund, and privacy policies.

## Customer order recovery

The V2 website stores recent order access tokens under the isolated `meemon:v2:orders` browser key, so a customer can close the payment page and return through `/v2/orders`. When using another device, recovery requires both the complete order number and the Thai mobile number used at checkout. The recovery endpoint is protected by Turnstile and rate limiting and never exposes an order from a phone number alone.

Checkout accepts Thai mobile numbers beginning with 06, 08, or 09 and records `country_code=TH`. The UI and database contract allow shipping addresses in Thailand only.
