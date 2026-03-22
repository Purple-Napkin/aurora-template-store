/**
 * When true, clicking this mission pill should lock Holmes into recipe/combo mode (server-side).
 */
export function shouldLockRecipeMissionForMissionPill(label: string, href: string): boolean {
  const l = label.toLowerCase();
  const h = href.toLowerCase();
  if (/\/recipes\/?$/i.test(h) || h === "/recipes") return true;
  if (/\/combos\/?$/i.test(h) || h === "/combos") return true;
  if (/\bsnack\b|top\s*up\s*essentials|under\s*£|repeat\s*last|travel|packing|face\s*wipes|adapter/i.test(l))
    return false;
  if (
    /dinner|breakfast|lunch|brunch|recipe|cook|meal|quick|healthy|fresh\s*ingredient|hosting|wine\s*\+|cheese|project kit|tool kit|kits\s*&\s*bundles|diy bundle/i.test(
      l
    )
  )
    return true;
  if (
    /q=dinner|q=breakfast|q=lunch|q=brunch|q=recipe|q=quick\+meal|q=quick\+dinner|q=healthy|q=fresh|q=wine/i.test(
      h
    )
  )
    return true;
  return false;
}
