import { escapeHtml, renderLayout } from './layout';
import { TemplateVariables } from './types';

export function subject(variables: TemplateVariables): string {
  const period = String(variables['period'] ?? '');
  return `Votre rapport mensuel WARAH — ${period}`;
}

export function render(variables: TemplateVariables): string {
  const period = escapeHtml(String(variables['period'] ?? ''));

  const body = `
    <p>Bonjour,</p>
    <p>Voici le rapport d'activité de votre gestionnaire pour la période <strong>${period}</strong>.</p>
    <p>Vous trouverez en pièce jointe le détail des paiements reçus, des retards éventuels et de l'occupation de vos biens.</p>
  `;

  return renderLayout(body, { preheader: `Votre rapport mensuel ${period} est disponible.` });
}
