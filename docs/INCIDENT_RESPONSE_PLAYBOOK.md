# ConsistencyGrid Incident Response Playbook

## Overview
This document provides step-by-step procedures for handling common production incidents at ConsistencyGrid.

**On-Call Schedule**: [Team Calendar Link]
**Escalation Contact**: ops@consistencygrid.com
**War Room**: Slack #incident-response

---

## INCIDENT SEVERITY LEVELS

| Level | Description | Response Time | Page On-Call |
|-------|-------------|----------------|-------------|
| **SEV-1** | Complete service outage, data loss | 5 minutes | YES |
| **SEV-2** | Major functionality broken, >50% users affected | 15 minutes | YES |
| **SEV-3** | Partial functionality broken, <50% users affected | 30 minutes | NO |
| **SEV-4** | Minor issues, workaround available | 1 hour | NO |

---

## INCIDENT #1: HIGH ERROR RATE (>1%)

### Detection
- Sentry alert: "Error Rate Spike"
- Dashboard shows red: Error rate > 1% for 5+ minutes

### Immediate Response (5 min)
```bash
# 1. Page on-call immediately (SEV-2)
slack @oncall "Error rate spike detected - SEV-2"

# 2. Check recent deployments
git log --oneline -10

# 3. Check Sentry for error pattern
# - Go to: Sentry → Issues → Filter by timestamp
# - Look for: Common error message, affected URL, stack trace
```

### Investigation (10 min)
```bash
# 1. Check application logs
kubectl logs -l app=consistencygrid --tail=500

# 2. Check error distribution
# - Frontend errors vs Backend errors?
# - Specific endpoint or global?
# - Specific user cohort affected?

# 3. Check if deployment is the cause
# If deployed in last 30 min:
#   - ERROR: ROLLBACK IMMEDIATELY
git revert <commit-hash>
npm run build
yarn deploy --rollback

# 4. Check database health
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
```

### Root Cause Analysis
- **Pattern: Mostly 500 errors from one endpoint?**
  - Check endpoint handler for recent changes
  - Look for database query errors in logs
  - Check rate limiting: Are legitimate requests being blocked?

- **Pattern: 429 (Rate Limited) errors spike?**
  - Possible DDoS attack or abuse
  - Check IP source in access logs
  - Deploy IP-based rate limiting rules

- **Pattern: Memory errors (Out of Memory)?**
  - Check memory usage: `free -h`
  - Restart application: `kubectl rollout restart deployment/consistencygrid`
  - Scale up resources if spike is permanent

- **Pattern: Database connection errors?**
  - Check DB connection pool status
  - Increase pool size if at max
  - Check for long-running queries

### Resolution
```bash
# If you identified the issue:
1. Fix the bug in a new commit
2. Merge to main
3. Build and deploy
4. Monitor error rate for 10 minutes

# If you rolled back:
1. Keep rolled-back version running
2. Create post-incident review
3. Schedule fix and thorough testing
```

### Post-Incident
1. Create incident ticket: "High error rate on [timestamp]"
2. Document: What caused it, how we fixed it, what prevents it
3. Schedule post-mortem within 24 hours
4. Update runbook if new pattern discovered

---

## INCIDENT #2: SLOW RESPONSE TIMES (P95 >3s)

### Detection
- Sentry alert: "Slow Response Times"
- Dashboard shows P95 response time > 3 seconds

### Immediate Response (5 min)
```bash
# 1. Verify on your machine
curl -w "@curl-format.txt" https://app.consistencygrid.com

# 2. Check if it's global or regional
# Ask in #incident-response: "Are you seeing slow loads?"

# 3. Check recent changes
git log --oneline -5
```

### Investigation (15 min)
```bash
# 1. Identify slowest endpoints
# In Sentry → Performance → Transactions
# Sort by Duration (slowest first)

# 2. Check database query performance
# Enable slow query log:
psql $DATABASE_URL -c "ALTER SYSTEM SET log_min_duration_statement = 1000;"

# 3. Check specific slow transaction
# Look for patterns: wallpaper generation? payment processing?

# 4. Check system resources
kubectl top nodes   # Check CPU/Memory
kubectl top pods    # Check pod usage
```

### Common Causes & Fixes

**Cause 1: Wallpaper Generation Slow**
```bash
# Check PNG generation time
grep "Canvas.toBuffer" server.log

# If taking >2 seconds:
# - Check grid size (should be <50x50)
# - Check cache hit rate
# - Verify CDN is serving cached images
```

**Cause 2: Database Queries Slow**
```bash
# Check query plans
psql $DATABASE_URL -c "EXPLAIN ANALYZE SELECT * FROM habit WHERE userId='$user_id';"

# If no index used:
# Run migration:
psql $DATABASE_URL < prisma/migrations/*/migration.sql

# Verify indexes exist:
psql $DATABASE_URL -c "\di"  # List all indexes
```

**Cause 3: Memory Pressure**
```bash
# Check free memory
free -h
# If <500MB available:
kubectl delete pod <pod-name>  # Will restart and get fresh memory

# If still slow, scale up:
kubectl scale deployment consistencygrid --replicas=3
```

**Cause 4: Cache Misses**
```bash
# Check Redis/Cache status
redis-cli ping

# Check cache hit rate
redis-cli info stats | grep "hits"

# If hit rate <80%:
# - Increase cache TTL
# - Pre-warm cache with popular items
```

### Resolution
```bash
# Once cause is fixed:
1. Verify P95 drops below 3s in Sentry
2. Monitor for 10 minutes
3. If stable, close incident
```

### Post-Incident
1. Document: What caused slowness
2. Implement permanent fix if needed
3. Add to dashboard: "Track wallpaper gen time" or "Track slow queries"

---

## INCIDENT #3: PAYMENT PROCESSING FAILURES (>2%)

### Detection
- Sentry alert: "Payment Processing Failures"
- Dashboard shows payment error rate > 2%

### CRITICAL: DO NOT LOSE PAYMENT DATA
All payment attempts must be logged, even if verification fails.

### Immediate Response (5 min)
```bash
# 1. Page on-call immediately (SEV-1)
slack @oncall "Payment failures spike - SEV-1"

# 2. Check payment gateway status
# - Razorpay: https://razorpay.statuspage.io
# - Stripe: https://status.stripe.com

# 3. Check recent payment errors
# Go to: src/app/api/payment/ logs
```

### Investigation (10 min)
```bash
# 1. Check payment verification logs
psql $DATABASE_URL -c "
  SELECT 
    id, provider, status, error_message, created_at 
  FROM payment_attempts 
  WHERE status='failed' 
  ORDER BY created_at DESC 
  LIMIT 20;
"

# 2. Look for error patterns
# - All from Razorpay or Stripe?
# - All for specific plan?
# - All from specific country/payment method?

# 3. Check API keys are valid
echo "RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID"
echo "RAZORPAY_KEY_SECRET=$RAZORPAY_KEY_SECRET"
# Both should be non-empty production keys
```

### Common Causes & Fixes

**Cause 1: Razorpay/Stripe API Down**
```bash
# Wait for service recovery
# Meanwhile: Display message to users
# "Payments temporarily unavailable - retry in 5 min"

# Check status pages every 2 minutes
# Estimated impact: Users can't purchase, but won't lose orders
```

**Cause 2: Invalid API Keys**
```bash
# Verify keys are loaded correctly
curl -I -H "Authorization: Basic $(echo -n 'KEY_ID:KEY_SECRET' | base64)" \
  https://api.razorpay.com/v1/payments

# If 401: Keys are invalid
# Solution:
# 1. Update .env with correct keys
# 2. Restart application
# 3. Test payment flow again
```

**Cause 3: Rate Limiting on Payment Endpoint**
```bash
# Check recent payment requests
grep "429" /var/log/nginx/access.log | tail -20

# If many 429s:
# - Check if legitimate traffic pattern or attack
# - Increase rate limit threshold temporarily
# - Add IP whitelist for known payment webhooks
```

**Cause 4: Database Connection Issues**
```bash
# Check if DB can accept connections
psql $DATABASE_URL -c "SELECT 1;" 

# If fails:
# - Check DB is running
# - Check connection pool not exhausted
# - Restart DB or scale up

# Check payment_transactions table exists
psql $DATABASE_URL -c "\dt payment_transactions"
```

### Data Recovery
```bash
# CRITICAL: Verify no payments were lost
psql $DATABASE_URL -c "
  SELECT 
    COUNT(*) as total_failed,
    COUNT(CASE WHEN webhook_received=true THEN 1 END) as verified,
    COUNT(CASE WHEN webhook_received=false THEN 1 END) as unverified
  FROM payment_transactions 
  WHERE created_at > NOW() - INTERVAL '1 hour'
  AND status = 'failed';
"

# For unverified payments: Send webhook retry request
# Contact ops@consistencygrid.com if data integrity questionable
```

### Resolution
```bash
# Once cause is fixed:
1. Test payment flow end-to-end
2. Verify success rate >98% for 10 minutes
3. Notify users: "Payments restored"
```

### Post-Incident
1. Review all failed payments from incident window
2. Manually verify large transactions if needed
3. Update payment retry logic if improvements needed
4. Schedule: "Payment resilience hardening" task

---

## INCIDENT #4: DATABASE SLOW (Query >1s)

### Detection
- Sentry alert: "Database Query Slow"
- Dashboard shows slow transaction from database

### Immediate Response (5 min)
```bash
# 1. Identify slow query
# In Sentry → Transactions → Filter by duration
# Look for query >1 second

# 2. Check query in slow query log
tail -50 /var/log/postgresql/postgresql.log | grep "SLOW"
```

### Investigation (10 min)
```bash
# 1. Get the slow query
psql $DATABASE_URL -c "
  SELECT query, calls, mean_exec_time 
  FROM pg_stat_statements 
  WHERE mean_exec_time > 1000 
  ORDER BY mean_exec_time DESC 
  LIMIT 5;
"

# 2. Analyze query plan
psql $DATABASE_URL -c "
  EXPLAIN ANALYZE SELECT * FROM habits WHERE userId='$user_id' AND active=true;
"

# 3. Check if index exists for this query
# If output shows: "Seq Scan on habits" → INDEX MISSING
# If shows "Index Scan" → Index exists but maybe not used well
```

### Common Fixes

**Fix 1: Missing Index**
```bash
# Create index immediately (non-blocking)
psql $DATABASE_URL -c "
  CREATE INDEX CONCURRENTLY idx_habit_search 
  ON habits(userId, active);
"

# Verify index is used
EXPLAIN ANALYZE SELECT * FROM habits WHERE userId='$user_id' AND active=true;
# Should now show: "Index Scan"
```

**Fix 2: Table Full Scan Can't Be Avoided**
```bash
# If joining large tables, might need partitioning
# For now: Optimize application code instead

# Example: Instead of:
SELECT * FROM habit_logs WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY);

# Better: Use WHERE clause with indexed column
SELECT * FROM habit_logs WHERE habitId=$habitId AND created_at > DATE;
```

**Fix 3: N+1 Query Problem**
```bash
# If application is running many queries in loop:
# Aggregate in application code
const habits = await prisma.habit.findMany({
  where: { userId },
  include: { logs: { take: 30 } }  // Fetch all in one query
});
```

### Resolution
```bash
# After fix:
1. Run ANALYZE to update stats
psql $DATABASE_URL -c "ANALYZE;"

2. Monitor query time
# Should drop from >1s to <100ms

3. Verify in Sentry after 5 minutes
```

---

## INCIDENT #5: HIGH MEMORY USAGE (>85%)

### Detection
- Sentry alert: "Memory Usage Critical"
- Server feels slow, requests timing out

### Immediate Response (3 min)
```bash
# 1. Check memory immediately
free -h

# 2. Identify memory-heavy processes
top -o %MEM -b -n 1 | head -20
ps aux --sort=-%mem | head -5
```

### Investigation (5 min)
```bash
# 1. Check Node.js heap size
node -e "console.log(require('v8').getHeapStatistics())"

# 2. Check if memory leak
# Is memory growing over time?
# Or sudden spike?

# 3. Check Docker/Kubernetes memory limit
docker stats  # If using Docker
kubectl describe pod <pod-name> | grep -i memory

# 4. Check for known memory leaks
grep -r "setInterval" src/ --include="*.js" | grep -v "clearInterval"
```

### Quick Fixes

**Fix 1: Restart Application**
```bash
# Fastest way to free memory
docker restart consistencygrid
# or
kubectl rollout restart deployment/consistencygrid

# Service will be down ~10 seconds, then recover
```

**Fix 2: Increase Memory Limit**
```bash
# If legitimate spike (e.g., 100k concurrent users):
docker update --memory=2g consistencygrid
# or
# Edit deployment memory: 512Mi → 2Gi
kubectl set resources deployment consistencygrid --memory=2Gi
```

**Fix 3: Check for Memory Leak**
```bash
# If memory still high after restart:
# 1. Deploy with NODE_OPTIONS=--expose-gc
# 2. Add heap snapshots: require('heapdump')
# 3. Compare heap snapshots to find leak

# Temporary mitigation: Increase restart frequency
docker update --restart=unless-stopped consistencygrid
```

### Post-Incident
1. Profile application memory usage
2. Add memory monitoring dashboard
3. Set up automatic restart if memory >90%
4. Review for memory leaks in recent code changes

---

## INCIDENT #6: RATE LIMITING ABUSE (>100 429s/min)

### Detection
- Sentry alert: "Rate Limit Abuse"
- Dashboard shows 429 responses spiking

### Immediate Response (2 min)
```bash
# 1. Check request source
tail -100 /var/log/nginx/access.log | grep "429" | awk '{print $1}' | sort | uniq -c

# 2. Identify if attack or legitimate traffic
# Check if single IP or distributed
# Check request pattern (random endpoints or specific?)
```

### Investigation (5 min)
```bash
# 1. Get top IPs making 429s
grep "429" /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10

# 2. Check if whitelist/VPN
# Compare against known IPs:
# - CI/CD pipeline
# - Monitoring services
# - Company office IPs

# 3. Get detailed request info
grep "429" /var/log/nginx/access.log | head -5
# Check: User-Agent, Endpoint, Request method
```

### Action Plan

**Scenario 1: Single IP Making Many Requests**
```bash
# Likely: Bot, scraper, or attacker
# Action: Block at nginx level
# Add to nginx.conf:
# deny 192.168.1.100;

# Reload nginx
nginx -t && systemctl reload nginx

# Or use fail2ban:
fail2ban-client set consistencygrid banip 192.168.1.100
```

**Scenario 2: Distributed Attack (Many IPs)**
```bash
# Likely: DDoS attack
# Action: Enable DDoS protection
# - Enable Cloudflare if not already
# - Set rate limiting globally (slower, catch-all)
# - Temporarily reduce rate limits to 5 req/min

# Temporary nginx config:
limit_req_zone $binary_remote_addr zone=api:10m rate=5r/m;
limit_req zone=api burst=10;
```

**Scenario 3: Legitimate Traffic Spike**
```bash
# Scenario: Viral content, surge in users
# Action: Increase rate limits
# Update src/lib/api-rate-limit.js:
# OLD: 10 requests/min
# NEW: 30 requests/min

# Redeploy and monitor
```

### Resolution
```bash
# Once issue resolved:
1. Monitor for 30 minutes
2. If attack: Keep block in place
3. If legitimate: Keep limits at new level
4. Review traffic patterns to prevent future

# Clear fail2ban if needed:
fail2ban-client set consistencygrid unbanall
```

---

## INCIDENT #7: COMPLETE SERVICE OUTAGE

### Detection
- Website returns 500 for all requests
- All API endpoints down
- Sentry showing error rate 100%

### CRITICAL: 5-MINUTE RESPONSE TIME

### Immediate Response (2 min)
```bash
# 1. Page everyone on-call (SEV-1)
slack @channel "PRODUCTION OUTAGE - SEV-1"
pagerduty page on_call

# 2. Determine service status
curl https://app.consistencygrid.com
# Or check specific components

# 3. Check basic health
kubectl get pods -l app=consistencygrid
# Should see: Running, Ready 1/1
```

### Quick Diagnosis (3 min)
```bash
# 1. Check pod status
kubectl describe pod <pod-name>
# Look for: CrashLoopBackOff, ImagePullBackOff, Pending

# 2. Check logs
kubectl logs <pod-name> | tail -50

# 3. Check if recent deployment failed
kubectl rollout history deployment/consistencygrid

# 4. Check dependencies
# - Database reachable?
psql $DATABASE_URL -c "SELECT 1;"
# - Redis up?
redis-cli ping
```

### Recovery (by diagnosis)

**If pod is CrashLoopBackOff:**
```bash
# 1. Check logs for error
kubectl logs <pod-name>

# 2. If recent deployment: Rollback
kubectl rollout undo deployment/consistencygrid

# 3. Monitor for recovery
kubectl get pods -w
# Should see: Running, Ready 1/1 within 30s
```

**If database connection fails:**
```bash
# 1. Check database status
kubectl get pod -l app=postgres
psql $DATABASE_URL -c "SELECT 1;"

# 2. If DB down: Restart
kubectl restart pod postgres-pod

# 3. If still down: Failover to backup
# Contact AWS/GCP for database recovery
```

**If all pods pending:**
```bash
# 1. Check cluster status
kubectl get nodes
# All should show: Ready

# 2. Check resource availability
kubectl top nodes
# If CPU/Memory near 100%: Scale cluster

# 3. Delete and recreate pods
kubectl delete pod -l app=consistencygrid --all
kubectl apply -f deployment.yaml
```

### Post-Incident (IMMEDIATE)
1. **Announce status**: Post in Slack what's happening
2. **Document timeline**: When detected, root cause, time to recovery
3. **Create incident ticket**: For post-mortem
4. **Follow-up within 1 hour**: Technical review of what happened

---

## INCIDENT #8: SECURITY EVENT

### Detection
- Sentry alert: "Security Event Detected"
- Suspicious login attempts
- Unauthorized API access detected

### Immediate Response (10 min)
```bash
# 1. Page security team (SEV-2)
slack @security "Security event detected"

# 2. Gather evidence
# - What endpoint attacked?
# - What IP address?
# - What user IDs?
# - When did it start?

# 3. Check security logs
grep "401\|403" /var/log/nginx/access.log | tail -50

# 4. Check failed authentication attempts
psql $DATABASE_URL -c "
  SELECT user_id, email, COUNT(*) as attempts 
  FROM auth_failures 
  WHERE created_at > NOW() - INTERVAL '1 hour' 
  GROUP BY user_id 
  ORDER BY attempts DESC;
"
```

### Investigation
```bash
# 1. Identify attack pattern
# - Brute force on login?
# - SQL injection attempt?
# - API token theft?

# 2. Check for data access
# Did attacker successfully authenticate?
# What data might have been accessed?

# 3. Check for lateral movement
# Any suspicious API calls after successful auth?
```

### Response

**If Brute Force Attack:**
```bash
# 1. Block IP
fail2ban-client set consistencygrid banip <attacker-ip>

# 2. Force password reset for targeted users
psql $DATABASE_URL -c "
  UPDATE users 
  SET password_reset_required=true 
  WHERE id IN (SELECT user_id FROM auth_failures WHERE created_at > NOW() - INTERVAL '1 hour');
"

# 3. Email affected users
# "We detected suspicious login attempts. Please reset your password."
```

**If Data Breach Suspected:**
```bash
# 1. Immediately revoke attacker's access
# 2. Check what data was accessed in audit logs
# 3. Contact affected users within 1 hour
# 4. Report to regulatory bodies if PII accessed
# 5. Activate incident response team
```

**If Code Injection/RCE:**
```bash
# 1. IMMEDIATELY isolate affected servers
kubectl delete pod <pod-name>

# 2. Restore from clean backup
kubectl rollout undo deployment/consistencygrid

# 3. Run security audit
# Check for unauthorized changes to code
git log --all --oneline -20
git diff HEAD~5

# 4. Force all users to re-authenticate
# Update JWT secret to invalidate all tokens
```

### Post-Incident
1. **Full security audit**: Bring in external security team
2. **Root cause analysis**: How did they get in?
3. **Remediation**: Apply fixes and verify
4. **User communication**: Transparent incident report
5. **Prevention**: Harden authentication, add WAF rules

---

## GENERAL INCIDENT PROCEDURES

### Escalation Chain
```
1. Issue detected → Page on-call
2. On-call investigating → Page team lead if unclear
3. Team lead if can't resolve within 15 min → Page manager
4. Manager if security/data loss → Page C-level
```

### War Room Setup
```bash
# 1. Start incident room
slack /open-incident-room <name>

# 2. Assign roles
- Incident Commander: Manages incident
- Tech Lead: Investigates root cause
- Comms Lead: Updates stakeholders
- Scribe: Documents everything

# 3. Use #incident-response for updates
# Format: [TIMESTAMP] [STATUS] [ACTION] [RESULT]
```

### Documentation Template
```
INCIDENT: [Name and number]
SEVERITY: [SEV-1/2/3/4]
START TIME: [UTC]
END TIME: [UTC]
DURATION: [X minutes]

ROOT CAUSE:
[What actually caused the issue]

IMPACT:
[How many users affected, what functionality broken]

TIMELINE:
[When detected, when investigation started, when fixed]

RESOLUTION:
[What we did to fix it]

PREVENTION:
[What we'll do to prevent it happening again]

FOLLOW-UP:
[Tasks created for permanent fix]
```

### Post-Incident Checklist
```
□ Create follow-up tickets for permanent fixes
□ Schedule post-mortem meeting within 24 hours
□ Update runbook if new pattern discovered
□ Update dashboards/alerts if gaps found
□ Communicate with affected users
□ Update documentation
□ Close incident ticket
```

---

## USEFUL COMMANDS

### Database
```bash
# Connect to production database
psql $DATABASE_URL

# Check database size
SELECT pg_size_pretty(pg_database_size('consistencygrid'));

# Find slow queries
SELECT mean_exec_time, query FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

# Monitor active connections
SELECT count(*) FROM pg_stat_activity;
```

### Application
```bash
# View recent logs
kubectl logs deployment/consistencygrid --tail=100

# Watch logs in real-time
kubectl logs deployment/consistencygrid -f

# Scale pods
kubectl scale deployment/consistencygrid --replicas=3

# Rolling restart
kubectl rollout restart deployment/consistencygrid

# Rollback last deployment
kubectl rollout undo deployment/consistencygrid
```

### System
```bash
# Check CPU/Memory
kubectl top nodes
kubectl top pods

# Check disk space
df -h

# Check network connections
netstat -an | grep ESTABLISHED | wc -l
```

---

## CONTACT INFO

| Role | Contact | Availability |
|------|---------|--------------|
| On-Call | See PagerDuty | 24/7 |
| Team Lead | team-lead@consistencygrid.com | 9am-5pm |
| Manager | manager@consistencygrid.com | 9am-9pm |
| Security | security@consistencygrid.com | 24/7 (page) |
| Database Admin | dba@consistencygrid.com | 24/7 (page) |

---

**Last Updated**: 2025-01-XX
**Next Review**: 2025-02-XX
**Approved By**: Engineering Manager
