import { escapeHtml, renderButton, renderLayout } from './layout';
import { TemplateVariables } from './types';

export function subject(): string {
  return 'Nouveau contact pour votre annonce';
}

export function render(variables: TemplateVariables): string {
  const candidateName = escapeHtml(String(variables['candidateName'] ?? ''));
  const candidatePhone = escapeHtml(String(variables['candidatePhone'] ?? ''));
  const message = escapeHtml(String(variables['message'] ?? ''));
  const listingAddress = escapeHtml(String(variables['listingAddress'] ?? ''));
  const whatsappDigits = String(variables['candidatePhone'] ?? '').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappDigits}`;

  const body = `
    <p>Bonjour,</p>
    <p><strong>${candidateName}</strong> est intéressé(e) par votre annonce <strong>${listingAddress}</strong>.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background-color:#F4F6F9;border-radius:6px;">
      <tr>
        <td style="padding:16px 20px;font-size:14px;">
          <p style="margin:0 0 8px;"><strong>Téléphone :</strong> ${candidatePhone}</p>
          <p style="margin:0;"><strong>Message :</strong> ${message}</p>
        </td>
      </tr>
    </table>
    ${renderButton('Contacter sur WhatsApp', whatsappUrl)}
  `;

  return renderLayout(body, { preheader: `${candidateName} est intéressé(e) par votre annonce.` });
}
