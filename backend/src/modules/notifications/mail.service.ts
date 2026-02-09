import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const MESSAGE_PREVIEW_LENGTH = 300;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getFrom(config: ConfigService): string {
  return config.get<string>('MAIL_FROM') || config.get<string>('MAIL_USER') || 'noreply@mentoring';
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('MAIL_HOST');
    const port = this.config.get<number>('MAIL_PORT');
    const user = this.config.get<string>('MAIL_USER');
    const pass = this.config.get<string>('MAIL_PASSWORD');
    if (host && port != null && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      this.logger.warn(
        'SMTP не настроен (MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD). Письма не будут отправляться.',
      );
    }
  }

  /**
   * Отправка письма о новой заявке ментору. Вызывать асинхронно (не блокировать ответ API).
   */
  sendNewRequestNotification(params: {
    toEmail: string;
    menteeFirstName: string;
    menteeLastName: string;
    messagePreview: string;
  }): void {
    if (!this.transporter) return;

    const { toEmail, menteeFirstName, menteeLastName, messagePreview } = params;
    const f = escapeHtml(menteeFirstName);
    const l = escapeHtml(menteeLastName);
    const msg = escapeHtml(messagePreview);
    const subject = 'Новая заявка на менторство';
    const text = [
      'Вам отправлена заявка на менторство.',
      '',
      `От: ${menteeFirstName} ${menteeLastName}`,
      '',
      'Сопроводительное письмо:',
      messagePreview,
      '',
      'Войдите в платформу, чтобы принять или отклонить заявку.',
    ].join('\n');
    const html = [
      '<p>Вам отправлена заявка на менторство.</p>',
      `<p><strong>От:</strong> ${f} ${l}</p>`,
      '<p><strong>Сопроводительное письмо:</strong></p>',
      `<p>${msg.replace(/\n/g, '<br>')}</p>`,
      '<p>Войдите в платформу, чтобы принять или отклонить заявку.</p>',
    ].join('');

    this.transporter
      .sendMail({
        from: getFrom(this.config),
        to: toEmail,
        subject,
        text,
        html,
      })
      .then(() => {
        this.logger.log(`Письмо о новой заявке отправлено на ${toEmail}`);
      })
      .catch((err) => {
        this.logger.error(`Ошибка отправки письма на ${toEmail}: ${err.message}`, err.stack);
      });
  }

  /**
   * Уведомление о решении по заявке (принята/отклонена). Получатель — менти.
   */
  sendRequestDecisionNotification(params: {
    toEmail: string;
    accepted: boolean;
    mentorFirstName: string;
    mentorLastName: string;
  }): void {
    if (!this.transporter) return;

    const { toEmail, accepted, mentorFirstName, mentorLastName } = params;
    const f = escapeHtml(mentorFirstName);
    const l = escapeHtml(mentorLastName);
    const mentorName = [mentorFirstName, mentorLastName].filter(Boolean).join(' ') || 'Ментор';
    const mentorNameEscaped = [f, l].filter(Boolean).join(' ') || 'Ментор';
    const resultText = accepted ? 'Заявка принята' : 'Заявка отклонена';
    const subject = accepted ? 'Ваша заявка на менторство принята' : 'Решение по вашей заявке на менторство';
    const text = [
      `${mentorName} ${accepted ? 'принял' : 'отклонил'} вашу заявку на менторство.`,
      '',
      `Результат: ${resultText}.`,
      '',
      accepted
        ? 'Войдите в платформу, чтобы посмотреть контактные данные ментора и связаться с ним.'
        : 'Войдите в платформу, чтобы посмотреть каталог менторов и отправить заявку другому ментору.',
    ].join('\n');
    const html = [
      `<p>${mentorNameEscaped} ${accepted ? 'принял' : 'отклонил'} вашу заявку на менторство.</p>`,
      `<p><strong>Результат:</strong> ${escapeHtml(resultText)}.</p>`,
      '<p>',
      accepted
        ? 'Войдите в платформу, чтобы посмотреть контактные данные ментора и связаться с ним.'
        : 'Войдите в платформу, чтобы посмотреть каталог менторов и отправить заявку другому ментору.',
      '</p>',
    ].join('');

    this.transporter
      .sendMail({
        from: getFrom(this.config),
        to: toEmail,
        subject,
        text,
        html,
      })
      .then(() => {
        this.logger.log(`Письмо о решении по заявке отправлено на ${toEmail}`);
      })
      .catch((err) => {
        this.logger.error(`Ошибка отправки письма на ${toEmail}: ${err.message}`, err.stack);
      });
  }

  /**
   * Уведомление об откреплении (отвязке). Отправлять второй стороне связи.
   */
  sendDetachNotification(params: {
    toEmail: string;
    otherSideFirstName: string;
    otherSideLastName: string;
    reason?: string | null;
  }): void {
    if (!this.transporter) return;

    const { toEmail, otherSideFirstName, otherSideLastName, reason } = params;
    const name = [otherSideFirstName, otherSideLastName].filter(Boolean).join(' ') || 'Участник';
    const nameEscaped = escapeHtml(name);
    const reasonEscaped = reason?.trim() ? escapeHtml(reason.trim()) : '';
    const subject = 'Связь на платформе менторинга прекращена';
    const lines = [`Связь с ${name} была прекращена.`, ''];
    if (reason?.trim()) {
      lines.push('Причина:', reason.trim(), '');
    }
    lines.push('Войдите в платформу для просмотра своих связей.');
    const text = lines.join('\n');
    const htmlParts = [
      `<p>Связь с ${nameEscaped} была прекращена.</p>`,
      reason?.trim() ? `<p><strong>Причина:</strong> ${reasonEscaped}</p>` : '',
      '<p>Войдите в платформу для просмотра своих связей.</p>',
    ];
    const html = htmlParts.join('');

    this.transporter
      .sendMail({
        from: getFrom(this.config),
        to: toEmail,
        subject,
        text,
        html,
      })
      .then(() => {
        this.logger.log(`Письмо об отвязке отправлено на ${toEmail}`);
      })
      .catch((err) => {
        this.logger.error(`Ошибка отправки письма об отвязке на ${toEmail}: ${err.message}`, err.stack);
      });
  }

  /**
   * Формирует превью текста письма (первые N символов).
   */
  static truncateMessage(message: string, maxLength = MESSAGE_PREVIEW_LENGTH): string {
    const trimmed = message.trim();
    if (trimmed.length <= maxLength) return trimmed;
    return trimmed.slice(0, maxLength) + '…';
  }
}
