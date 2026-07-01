import { escapeHtml, renderLayout } from './layout';
import { TemplateVariables } from './types';

export function subject(): string {
  return 'Votre code de réinitialisation WARAH';
}

export function render(variables: TemplateVariables): string {
  const code = escapeHtml(String(variables['code'] ?? ''));
  const expirationMinutes = variables['expirationMinutes'] ?? 10;

  const body = `
    <p>Vous avez demandé la réinitialisation de votre mot de passe WARAH.</p>
    <p>Voici votre code de vérification :</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr>
        <td style="background-color:#F4F6F9;border:1px dashed #C9A227;border-radius:6px;padding:18px 28px;">
          <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#13284A;">${code}</span>
        </td>
      </tr>
    </table>
    <p>Ce code expire dans <strong>${String(expirationMinutes)} minutes</strong> et ne peut être utilisé qu'une seule fois.</p>
    <p style="font-size:13px;color:#6B7280;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email — votre mot de passe reste inchangé.</p>
  `;

  return renderLayout(body, { preheader: `Votre code WARAH : ${code}` });
}
