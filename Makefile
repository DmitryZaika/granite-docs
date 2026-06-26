# ────────────────────────────────────────────────────────────────────
# granite-docs — 1-click deployment to AWS (S3 + CloudFront + HTTPS)
# ────────────────────────────────────────────────────────────────────
#
# Usage:
#   make deploy          # full deploy: infra + sync + cache invalidation
#   make validate        # validate CloudFormation template
#   make stack           # create / update the CloudFormation stack only
#   make sync            # upload local files to S3
#   make invalidate      # purge CloudFront edge caches
#   make outputs         # show stack outputs (BucketName, URL, etc.)
#   make destroy         # 🗑  tear down the entire stack
#
# Load local configuration from .env (kept out of git)
-include .env
export

# Override on the command line or via .env:
#   DOMAIN_NAME    — e.g. docs.mydomain.com
#   HOSTED_ZONE_ID — e.g. Z08888801ABC123DEF456
# ────────────────────────────────────────────────────────────────────

STACK_NAME     ?= granite-docs
REGION         ?= us-east-1        # MUST be us-east-1 for CloudFront ACM certs

# ── Phony targets ───────────────────────────────────────────────────

.PHONY: deploy validate stack sync invalidate outputs destroy

# ── Full deployment pipeline ────────────────────────────────────────

deploy: validate stack sync invalidate
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "  ✅  Deployment complete!"
	@echo "  🌐  https://$(DOMAIN_NAME)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Step 1: Validate the template ───────────────────────────────────

validate:
	@echo "🔍 Validating CloudFormation template..."
	aws cloudformation validate-template \
		--template-body file://template.yaml \
		--region $(REGION)
	@echo "✅ Template is valid."

# ── Step 2: Create or update the stack ──────────────────────────────

stack:
	@echo "🚀 Deploying CloudFormation stack '$(STACK_NAME)'…"
	@echo "   Domain:       $(DOMAIN_NAME)"
	@echo "   Hosted Zone:  $(HOSTED_ZONE_ID)"
	aws cloudformation deploy \
		--template-file template.yaml \
		--stack-name $(STACK_NAME) \
		--region $(REGION) \
		--parameter-overrides \
			DomainName=$(DOMAIN_NAME) \
			HostedZoneId=$(HOSTED_ZONE_ID) \
		--capabilities CAPABILITY_IAM \
		--no-fail-on-empty-changeset
	@echo "✅ Stack deployment finished."

# ── Step 3: Sync static files to S3 ────────────────────────────────

sync:
	@echo "📤 Syncing files to S3…"
	@BUCKET=$$(aws cloudformation describe-stacks \
		--stack-name $(STACK_NAME) \
		--region $(REGION) \
		--query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \
		--output text 2>/dev/null); \
	if [ -z "$$BUCKET" ] || [ "$$BUCKET" = "None" ]; then \
		echo "❌ Could not determine S3 bucket name. Has the stack been deployed?"; \
		exit 1; \
	fi; \
	echo "   Bucket: s3://$$BUCKET"; \
	aws s3 sync . s3://$$BUCKET \
		--exclude ".git/*" \
		--exclude "template.yaml" \
		--exclude "Makefile" \
		--exclude "README.md" \
		--exclude ".env" \
		--exclude ".env.example" \
		--exclude ".gitignore" \
		--delete
	@echo "✅ Files synced."

# ── Step 4: Purge CloudFront cache ──────────────────────────────────

invalidate:
	@echo "🧹 Invalidating CloudFront cache…"
	@DIST_ID=$$(aws cloudformation describe-stacks \
		--stack-name $(STACK_NAME) \
		--region $(REGION) \
		--query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" \
		--output text 2>/dev/null); \
	if [ -z "$$DIST_ID" ] || [ "$$DIST_ID" = "None" ]; then \
		echo "❌ Could not determine CloudFront distribution ID. Has the stack been deployed?"; \
		exit 1; \
	fi; \
	echo "   Distribution: $$DIST_ID"; \
	INVALIDATION_ID=$$(aws cloudfront create-invalidation \
		--distribution-id $$DIST_ID \
		--paths "/*" \
		--query "Invalidation.Id" \
		--output text); \
	echo "   Invalidation: $$INVALIDATION_ID"
	@echo "✅ Cache invalidation submitted (propagation takes 1–5 minutes)."

# ── Utility: show stack outputs ─────────────────────────────────────

outputs:
	@aws cloudformation describe-stacks \
		--stack-name $(STACK_NAME) \
		--region $(REGION) \
		--query "Stacks[0].Outputs[*].[OutputKey,OutputValue]" \
		--output table 2>/dev/null || echo "❌ Stack '$(STACK_NAME)' not found."

# ── Tear everything down ────────────────────────────────────────────

destroy:
	@echo "⚠️  This will DELETE the CloudFormation stack and all resources."
	@echo "   The S3 bucket is retained (DeletionPolicy: Retain)."
	@read -p "Type 'yes' to confirm: " CONFIRM; \
	if [ "$$CONFIRM" != "yes" ]; then \
		echo "Aborted."; \
		exit 0; \
	fi
	aws cloudformation delete-stack \
		--stack-name $(STACK_NAME) \
		--region $(REGION)
	@echo "🗑  Stack deletion initiated. Run 'make outputs' to monitor progress."
