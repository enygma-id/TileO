> **Reference implementation snapshot (supplied October 2026).** This technical document is preserved from the provided TileO code archive for historical/engineering continuity. Paths, endpoints, tests and commands apply to that snapshot and must be checked against the official code import before being represented as supported release behavior.

# Connecting Your S3-Style Storage to TileO

To convert your TIFF files into MBTiles, TileO needs access to your source storage. We offer three different methods depending on your security requirements and whether your pipeline is a one-time job or a recurring sync.

---

## ⚡ Option 1: Presigned URL (Best for One-Time Processing)
If you want to test TileO quickly or only need to process a file once, you can use a temporary Presigned URL. 

* **Best For:** Quick starts, manual testing, and beginners.
* **Pipeline Type:** One-time conversion only (cannot be used for recurring syncs).
* **Security:** High (The link expires automatically after a set time).

### How to use it:
1. Go to your S3 provider (AWS, Cloudflare R2, MinIO, etc.).
2. Generate a **Presigned URL** for your TIFF file and set the expiration time to at least **1 or 2 hours** (to allow enough processing time).
3. Paste the URL directly into the TileO upload field and click **Process**.

---

## 🔑 Option 2: S3 Bucket Credentials / BYOC (Best for Automated Syncs)
If you want TileO to automatically check your bucket and update your MBTiles on a recurring schedule (e.g., every 24 hours), you can securely share restricted API keys.

* **Best For:** Developers using Cloudflare R2, DigitalOcean Spaces, MinIO, Supabase, or AWS S3.
* **Pipeline Type:** Recurring / Scheduled CI/CD pipelines.
* **Security:** Medium-High (Requires encrypting your credentials in our database).

### Prerequisite Security Recommendation:
For your safety, **do not use your master admin keys**. Create a new service user or API token in your cloud provider with **Read-Only (`s3:GetObject`)** permissions limited strictly to the specific bucket you want TileO to use.

### Fields required in TileO:
* **Endpoint URL:** (e.g., `https://s3.example.com` or `http://10.10.55.2:9000`)
* **Bucket Name:** (e.g., `my-spatial-data`)
* **Access Key ID:** (e.g., `AKIAIOSFODNN7EXAMPLE`)
* **Secret Access Key:** (e.g., `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)

---

## 🛡️ Option 3: AWS IAM Role Integration (Enterprise / Zero-Password)
If your infrastructure runs entirely on AWS S3 and your team has strict security compliance guidelines, you can authorize TileO using an IAM Role. No permanent passwords or secret keys are ever shared.

* **Best For:** AWS Enterprise users and DevOps engineers.
* **Pipeline Type:** Recurring / Scheduled CI/CD pipelines.
* **Security:** Highest (Uses secure AWS-to-AWS temporary token handshakes).

### How to use it:
1. TileO will provide you with our **AWS Account ID** and a unique **External ID**.
2. In your AWS Console, create a new IAM Role with a trust policy that permits TileO's Account ID and requires the External ID.
3. Attach a policy to that role allowing `s3:GetObject` and `s3:ListBucket` on your target bucket.
4. Copy the **Role ARN** (e.g., `arn:aws:iam::123456789012:role/TileOReadAccess`) and paste it into your TileO pipeline settings.

---

**Snapshot note:** This founding documentation describes the TileO Clean 4 implementation baseline. Actual commands, integrations, drivers, versions, test results and release images must be verified when code is imported. See [Technical baseline](TECHNICAL_BASELINE.md) and [Release policy](RELEASE_POLICY.md).
