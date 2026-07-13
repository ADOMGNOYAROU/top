import { escapeHtml, renderButton, renderLayout } from './layout';
import { TemplateVariables } from './types';

export function subject(): string {
  return 'Confirmez votre compte WARAH';
}

export function render(variables: TemplateVariables): string {
  const firstName = escapeHtml(String(variables['firstName'] ?? ''));
  const confirmationUrl = String(variables['confirmationUrl'] ?? '#');

  const body = `
    <p>Bonjour ${firstName},</p>
    <p>Bienvenue sur WARAH. Pour activer votre compte et commencer à gérer vos biens en toute sérénité, confirmez votre adresse email.</p>
    ${renderButton('Confirmer mon email', confirmationUrl)}
    <p style="font-size:13px;color:#6B7280;">Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>
  `;

  return renderLayout(body, {
    preheader: 'Confirmez votre adresse email pour activer votre compte WARAH.',
  });
}
