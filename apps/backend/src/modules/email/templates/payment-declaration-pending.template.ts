import { escapeHtml, renderAmountBox, renderLayout } from './layout';
import { TemplateVariables } from './types';

export function subject(): string {
  return 'Déclaration de paiement en attente de confirmation';
}

export function render(variables: TemplateVariables): string {
  const tenantName = escapeHtml(String(variables['tenantName'] ?? ''));
  const propertyAddress = escapeHtml(String(variables['propertyAddress'] ?? ''));

  const body = `
    <p>Bonjour,</p>
    <p><strong>${tenantName}</strong> a déclaré avoir payé son loyer pour le bien <strong>${propertyAddress}</strong>.</p>
    ${renderAmountBox('Montant déclaré', variables['amount'] ?? 0)}
    <p>Merci de vérifier et confirmer cette déclaration depuis votre espace WARAH.</p>
  `;

  return renderLayout(body, {
    preheader: 'Une déclaration de paiement attend votre confirmation.',
  });
}
