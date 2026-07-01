import { escapeHtml, renderLayout } from './layout';
import { TemplateVariables } from './types';

export function subject(): string {
  return 'Votre compte WARAH a été suspendu';
}

export function render(variables: TemplateVariables): string {
  const reason = escapeHtml(String(variables['reason'] ?? ''));

  const body = `
    <p>Bonjour,</p>
    <p>Votre compte WARAH a été suspendu. Motif : <strong>${reason}</strong>.</p>
    <p>Vous pouvez toujours vous connecter pour consulter vos informations, mais les actions de modification sont désactivées.</p>
    <p>Pour toute question, répondez simplement à cet email.</p>
  `;

  return renderLayout(body, { preheader: 'Votre compte WARAH a été suspendu.' });
}
