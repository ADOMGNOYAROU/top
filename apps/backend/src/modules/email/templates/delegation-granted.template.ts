import { escapeHtml, renderLayout } from './layout';
import { TemplateVariables } from './types';

export function subject(): string {
  return 'Délégation de gestion WARAH';
}

export function render(variables: TemplateVariables): string {
  const ownerName = escapeHtml(String(variables['ownerName'] ?? 'Un propriétaire'));

  const body = `
    <p>Bonjour,</p>
    <p><strong>${ownerName}</strong> vous a confié la gestion complète de son portefeuille immobilier sur WARAH.</p>
    <p>Vous pouvez désormais agir en son nom : créer des biens, gérer les baux, enregistrer des paiements, inviter des locataires.</p>
    <p>Le propriétaire conserve un accès en lecture seule et peut révoquer cette délégation à tout moment.</p>
    <p>Connectez-vous à votre espace gestionnaire pour commencer.</p>
  `;

  return renderLayout(body, { preheader: `${ownerName} vous a confié la gestion de son portefeuille.` });
}
