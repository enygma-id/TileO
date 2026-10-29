// Explicit human review statements carried in authenticated GitHub comments.
export const requiredDecisions = {
  Engineering: ['COMPARE_SCOPE=ACCEPT_EXCLUSION'],
  'Legal-IP': ['RIGHTS=APPROVE', 'EXCEPTIONS=EXC-001,EXC-002,EXC-003'],
  'Release-Steward': ['REVIEW=ACCEPT'],
};
export function decisionCommentValid(role,comment) {
  return !!requiredDecisions[role] && requiredDecisions[role].every(value=>String(comment).split(/\s+/).includes(value));
}
export function assertEnvironmentProtection(config,environment) {
  const rule=environment.protection_rules?.find(r=>r.type==='required_reviewers');
  const reviewers=(rule?.reviewers??[]).filter(r=>r.type==='User').map(r=>String(r.reviewer.id)).sort();
  if(String(environment.id)!==String(config.environment_id)||environment.can_admins_bypass!==false||rule?.prevent_self_review!==true||environment.deployment_branch_policy?.protected_branches!==true||!reviewers.length||JSON.stringify(reviewers)!==JSON.stringify(config.authorized_reviewers.map(String).sort())) throw Error('live environment protections/reviewers differ from policy');
}
