import { escapeHtml, renderLayout } from './layout';
import { TemplateVariables } from './types';

export function subject(): string {
  return 'Fin de délégation de gestion WARAH';
}

export function render(variables: TemplateVariables): string {
  const ownerName = escapeHtml(String(variables['ownerName'] ?? 'Le propriétaire'));

  const body = `
    <p>Bonjour,</p>
    <p><strong>${ownerName}</strong> a repris la gestion directe de son portefeuille immobilier.</p>
    <p>Votre délégation de pouvoir a été révoquée. Vous n'avez plus accès aux actions de gestion en son nom.</p>
    <p>Votre espace gestionnaire reste disponible pour vos autres mandats.</p>
  `;

  return renderLayout(body, { preheader: `${ownerName} a repris la gestion de son portefeuille.` });
}
