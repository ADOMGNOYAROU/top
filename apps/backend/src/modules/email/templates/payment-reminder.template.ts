import { escapeHtml, renderAmountBox, renderLayout } from './layout';
import { TemplateVariables } from './types';

export function subject(): string {
  return 'Rappel — échéance de loyer à venir';
}

export function render(variables: TemplateVariables): string {
  const period = escapeHtml(String(variables['period'] ?? ''));
  const dueDate = escapeHtml(String(variables['dueDate'] ?? ''));
  const propertyAddress = escapeHtml(String(variables['propertyAddress'] ?? ''));

  const body = `
    <p>Bonjour,</p>
    <p>Votre échéance de loyer pour <strong>${propertyAddress}</strong> approche.</p>
    ${renderAmountBox(`À payer avant le ${dueDate} — période ${period}`, variables['amount'] ?? 0)}
    <p>Vous pouvez régler directement via Mobile Money (T-Money ou Flooz) depuis votre espace WARAH.</p>
  `;

  return renderLayout(body, { preheader: `Rappel — échéance de loyer le ${dueDate}.` });
}
