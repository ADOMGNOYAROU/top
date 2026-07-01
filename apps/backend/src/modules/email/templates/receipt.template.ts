import { escapeHtml, renderAmountBox, renderLayout } from './layout';
import { TemplateVariables } from './types';

export function subject(): string {
  return 'Votre quittance de loyer WARAH';
}

export function render(variables: TemplateVariables): string {
  const period = escapeHtml(String(variables['period'] ?? ''));

  const body = `
    <p>Bonjour,</p>
    <p>Votre paiement de loyer pour la période <strong>${period}</strong> a bien été confirmé.</p>
    ${renderAmountBox('Montant perçu', variables['amount'] ?? 0)}
    <p>Votre quittance est jointe à cet email au format PDF.</p>
  `;

  return renderLayout(body, { preheader: 'Votre quittance de loyer est disponible.' });
}
