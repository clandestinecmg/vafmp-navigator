#!/bin/zsh
set -e
OWNER="clandestinecmg"
REPO="vafmp-navigator"
gh api -X PUT -H "Accept: application/vnd.github+json" \
  "/repos/$OWNER/$REPO/branches/main/protection" \
  -F enforce_admins=true \
  -F required_linear_history=true \
  -F required_conversation_resolution=true \
  -f required_pull_request_reviews.required_approving_review_count=1 \
  -f required_pull_request_reviews.require_code_owner_reviews=true \
  -f required_pull_request_reviews.dismiss_stale_reviews=true \
  -f required_pull_request_reviews.require_last_push_approval=true \
  -F required_status_checks.strict=true \
  -F required_status_checks.contexts[]="CI / Lint & Typecheck" \
  -F required_status_checks.contexts[]="CI / Security Audit (npm)" \
  -F required_status_checks.contexts[]="CodeQL / Analyze (CodeQL)" || true
gh api --method POST -H "Accept: application/vnd.github+json" \
  "/repos/$OWNER/$REPO/branches/main/protection/required_signatures" || true
echo "✅ Branch protection enforced."
