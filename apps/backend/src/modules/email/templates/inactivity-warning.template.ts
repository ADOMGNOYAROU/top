import { escapeHtml, renderLayout } from './layout';
import { TemplateVariables } from './types';

export function subject(variables: TemplateVariables): string {
  const daysRemaining = String(variables['daysRemaining'] ?? '');
  return `Votre compte WARAH sera suspendu dans ${daysRemaining} jours`;
}

export function render(variables: TemplateVariables): string {
  const daysRemaining = escapeHtml(String(variables['daysRemaining'] ?? ''));
  const deadlineDate = escapeHtml(String(variables['deadlineDate'] ?? ''));

  const body = `
    <p>Bonjour,</p>
    <p>Votre compte WARAH est inactif depuis un moment — aucun bien enregistré ni mandat actif.</p>
    <p>Sans action de votre part avant le <strong>${deadlineDate}</strong> (dans ${daysRemaining} jours), votre compte passera en lecture seule.</p>
    <p>Il suffit d'ajouter un bien ou d'accepter un mandat pour rester actif.</p>
  `;

  return renderLayout(body, {
    preheader: `Votre compte sera suspendu dans ${daysRemaining} jours.`,
  });
}
