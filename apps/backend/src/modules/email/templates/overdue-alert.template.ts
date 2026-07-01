import { escapeHtml, renderAmountBox, renderLayout } from './layout';
import { TemplateVariables } from './types';

export function subject(): string {
  return 'Alerte — loyer impayé';
}

export function render(variables: TemplateVariables): string {
  const tenantName = escapeHtml(String(variables['tenantName'] ?? ''));
  const propertyAddress = escapeHtml(String(variables['propertyAddress'] ?? ''));
  const period = escapeHtml(String(variables['period'] ?? ''));

  const body = `
    <p>Bonjour,</p>
    <p><strong>${tenantName}</strong> n'a pas encore réglé son loyer pour la période <strong>${period}</strong> concernant le bien <strong>${propertyAddress}</strong>.</p>
    ${renderAmountBox('Montant en retard', variables['amount'] ?? 0)}
    <p>Consultez votre tableau de bord WARAH pour relancer le locataire ou enregistrer un paiement manuel.</p>
  `;

  return renderLayout(body, { preheader: 'Un loyer est en retard de paiement.' });
}
