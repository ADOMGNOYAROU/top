import { Injectable } from '@nestjs/common';
import { PaymentStatus, UserRole } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { CreateExportDto } from './dto/create-export.dto';

interface ExportResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

@Injectable()
export class ExportsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateExport(user: AuthenticatedUser, dto: CreateExportDto): Promise<ExportResult> {
    const rows = await this.fetchRows(user, dto);
    const date = new Date().toISOString().slice(0, 10);
    const baseName = `${dto.type}-${date}`;

    switch (dto.format) {
      case 'csv':
        return this.toCsv(rows, `${baseName}.csv`);
      case 'excel':
        return this.toExcel(rows, dto.type, `${baseName}.xlsx`);
      case 'pdf':
      default:
        return this.toPdf(rows, dto.type, `${baseName}.pdf`);
    }
  }

  // ─── Collecte des données ────────────────────────────────────────────────────

  private async fetchRows(user: AuthenticatedUser, dto: CreateExportDto): Promise<Record<string, string>[]> {
    const ownerFilter = this.buildOwnerFilter(user);
    const dateFilter = this.buildDateFilter(dto);

    switch (dto.type) {
      case 'biens':
        return this.fetchBiens(ownerFilter);
      case 'locataires':
        return this.fetchLocataires(ownerFilter);
      case 'paiements':
        return this.fetchPaiements(ownerFilter, dateFilter);
      case 'contrats':
        return this.fetchContrats(ownerFilter, dateFilter);
      case 'rapports':
        return this.fetchRapportSummary(ownerFilter, dateFilter);
      default:
        return [];
    }
  }

  private buildOwnerFilter(user: AuthenticatedUser) {
    if (user.role === UserRole.MANAGER) {
      return { mandates: { some: { managerId: user.id, status: 'ACTIVE' } } };
    }
    return { ownerId: user.id };
  }

  private buildDateFilter(dto: CreateExportDto) {
    if (!dto.dateDebut && !dto.dateFin) return undefined;
    const filter: Record<string, Date> = {};
    if (dto.dateDebut) filter['gte'] = new Date(dto.dateDebut);
    if (dto.dateFin) filter['lte'] = new Date(dto.dateFin);
    return filter;
  }

  private async fetchBiens(ownerFilter: object): Promise<Record<string, string>[]> {
    const props = await this.prisma.property.findMany({
      where: ownerFilter,
      select: {
        address: true, neighborhood: true, city: true,
        type: true, status: true,
        surfaceArea: true, roomsCount: true,
        monthlyRent: true, monthlyCharges: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return props.map(p => ({
      Adresse: p.address,
      Quartier: p.neighborhood,
      Ville: p.city,
      Type: p.type,
      Statut: p.status,
      'Surface (m²)': String(p.surfaceArea),
      Pièces: String(p.roomsCount ?? ''),
      'Loyer (FCFA)': String(p.monthlyRent),
      'Charges (FCFA)': String(p.monthlyCharges),
      'Ajouté le': this.formatDate(p.createdAt),
    }));
  }

  private async fetchLocataires(ownerFilter: object): Promise<Record<string, string>[]> {
    const leases = await this.prisma.lease.findMany({
      where: { property: ownerFilter, status: 'ACTIVE' },
      select: {
        tenant: { select: { firstName: true, lastName: true, email: true, phone: true } },
        property: { select: { address: true, city: true } },
        monthlyRent: true,
        startDate: true,
        endDate: true,
      },
      orderBy: { startDate: 'desc' },
    });

    return leases.map(l => ({
      Prénom: l.tenant.firstName ?? '',
      Nom: l.tenant.lastName ?? '',
      Email: l.tenant.email ?? '',
      Téléphone: l.tenant.phone ?? '',
      Bien: l.property.address,
      Ville: l.property.city,
      'Loyer (FCFA)': String(l.monthlyRent),
      'Début bail': this.formatDate(l.startDate),
      'Fin bail': l.endDate ? this.formatDate(l.endDate) : 'Indéterminée',
    }));
  }

  private async fetchPaiements(ownerFilter: object, dateFilter?: Record<string, Date>): Promise<Record<string, string>[]> {
    const payments = await this.prisma.payment.findMany({
      where: {
        lease: { property: ownerFilter },
        ...(dateFilter ? { paidAt: dateFilter } : {}),
      },
      select: {
        paidAmount: true, paidAt: true, status: true, paymentMethod: true,
        lease: {
          select: {
            property: { select: { address: true } },
            tenant: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    return payments.map(p => ({
      Bien: p.lease.property.address,
      Locataire: `${p.lease.tenant.firstName ?? ''} ${p.lease.tenant.lastName ?? ''}`.trim(),
      'Montant (FCFA)': String(p.paidAmount),
      Statut: p.status,
      Mode: p.paymentMethod ?? '',
      'Date paiement': p.paidAt ? this.formatDate(p.paidAt) : '',
    }));
  }

  private async fetchContrats(ownerFilter: object, dateFilter?: Record<string, Date>): Promise<Record<string, string>[]> {
    const leases = await this.prisma.lease.findMany({
      where: {
        property: ownerFilter,
        ...(dateFilter ? { startDate: dateFilter } : {}),
      },
      select: {
        status: true, monthlyRent: true, monthlyCharges: true,
        startDate: true, endDate: true,
        property: { select: { address: true } },
        tenant: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    return leases.map(l => ({
      Bien: l.property.address,
      Locataire: `${l.tenant.firstName ?? ''} ${l.tenant.lastName ?? ''}`.trim(),
      Email: l.tenant.email ?? '',
      Statut: String(l.status),
      'Loyer (FCFA)': String(l.monthlyRent),
      'Charges (FCFA)': String(l.monthlyCharges),
      'Début': this.formatDate(l.startDate),
      'Fin': l.endDate ? this.formatDate(l.endDate) : 'Indéterminée',
    }));
  }

  private async fetchRapportSummary(ownerFilter: object, dateFilter?: Record<string, Date>): Promise<Record<string, string>[]> {
    const [totalBiens, biensOccupes, totalLocataires, payments] = await Promise.all([
      this.prisma.property.count({ where: ownerFilter }),
      this.prisma.property.count({ where: { ...ownerFilter, status: 'OCCUPIED' } }),
      this.prisma.lease.count({ where: { property: ownerFilter, status: 'ACTIVE' } }),
      this.prisma.payment.findMany({
        where: {
          lease: { property: ownerFilter },
          status: PaymentStatus.PAID,
          ...(dateFilter ? { paidAt: dateFilter } : {}),
        },
        select: { paidAmount: true },
      }),
    ]);

    const totalRevenu = payments.reduce((sum, p) => sum + p.paidAmount, 0);

    return [
      { Indicateur: 'Total biens', Valeur: String(totalBiens) },
      { Indicateur: 'Biens occupés', Valeur: String(biensOccupes) },
      { Indicateur: 'Locataires actifs', Valeur: String(totalLocataires) },
      { Indicateur: 'Paiements confirmés', Valeur: String(payments.length) },
      { Indicateur: 'Revenus totaux (FCFA)', Valeur: String(totalRevenu) },
    ];
  }

  // ─── Générateurs de format ───────────────────────────────────────────────────

  private toCsv(rows: Record<string, string>[], filename: string): ExportResult {
    if (rows.length === 0) {
      return { buffer: Buffer.from('Aucune donnée\n'), filename, contentType: 'text/csv; charset=utf-8' };
    }
    const headers = Object.keys(rows[0]);
    const lines = [
      headers.join(';'),
      ...rows.map(r => headers.map(h => `"${(r[h] ?? '').replace(/"/g, '""')}"`).join(';')),
    ];
    return {
      buffer: Buffer.from('﻿' + lines.join('\r\n'), 'utf-8'),
      filename,
      contentType: 'text/csv; charset=utf-8',
    };
  }

  private async toExcel(rows: Record<string, string>[], sheetName: string, filename: string): Promise<ExportResult> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'WARAH';
    const ws = wb.addWorksheet(sheetName);

    if (rows.length === 0) {
      ws.addRow(['Aucune donnée']);
    } else {
      const headers = Object.keys(rows[0]);
      ws.addRow(headers);
      const headerRow = ws.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F4C81' } };
      headerRow.alignment = { vertical: 'middle' };

      rows.forEach(r => ws.addRow(headers.map(h => r[h] ?? '')));
      ws.columns.forEach(col => { col.width = 20; });
    }

    const buffer = await wb.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(buffer),
      filename,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  private toPdf(rows: Record<string, string>[], title: string, filename: string): Promise<ExportResult> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        resolve({
          buffer: Buffer.concat(chunks),
          filename,
          contentType: 'application/pdf',
        });
      });

      // En-tête
      doc.fontSize(20).fillColor('#0F4C81').text('WARAH', 40, 40);
      doc.fontSize(14).fillColor('#333333').text(`Export — ${title}`, 40, 68);
      doc.fontSize(10).fillColor('#888888').text(`Généré le ${this.formatDate(new Date())}`, 40, 88);
      doc.moveTo(40, 105).lineTo(555, 105).strokeColor('#E5E7EB').stroke();

      if (rows.length === 0) {
        doc.moveDown(2).fontSize(12).fillColor('#666').text('Aucune donnée à exporter.');
        doc.end();
        return;
      }

      const headers = Object.keys(rows[0]);
      const colW = Math.min(Math.floor(515 / headers.length), 120);
      let y = 120;

      // En-têtes tableau
      doc.fillColor('#0F4C81').fontSize(8);
      headers.forEach((h, i) => {
        doc.text(h, 40 + i * colW, y, { width: colW - 4, ellipsis: true });
      });
      y += 16;
      doc.moveTo(40, y).lineTo(555, y).strokeColor('#0F4C81').lineWidth(0.5).stroke();
      y += 4;

      // Lignes
      doc.fontSize(8).fillColor('#333333');
      rows.forEach((row, idx) => {
        if (y > 760) {
          doc.addPage();
          y = 40;
        }
        if (idx % 2 === 0) {
          doc.rect(40, y - 2, 515, 14).fillColor('#F7F9FF').fill();
          doc.fillColor('#333333');
        }
        headers.forEach((h, i) => {
          doc.text(row[h] ?? '', 40 + i * colW, y, { width: colW - 4, ellipsis: true });
        });
        y += 14;
      });

      doc.end();
    });
  }

  private formatDate(d: Date): string {
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
