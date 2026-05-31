const logger = require('./logger');

class NotificationService {
  constructor() {
    this.emailService = process.env.EMAIL_SERVICE || 'mock';
    this.slackWebhook = process.env.SLACK_WEBHOOK_URL || null;
  }

  /**
   * Ticket çözüldüğünde bildirim gönder
   * @param {object} ticket - Ticket bilgileri
   * @param {object} user - Kullanıcı bilgileri
   * @returns {Promise<boolean>}
   */
  async notifyTicketResolved(ticket, user) {
    try {
      logger.info('Notification Process Started', { 
        ticketId: ticket.id, 
        userId: user.id,
        email: user.email 
      });

      // Email gönder
      await this.sendEmailNotification(
        user.email,
        `Ticket #${ticket.id} Çözüldü`,
        this.generateEmailContent(ticket, 'resolved')
      );

      // Slack'e gönder (varsa)
      if (this.slackWebhook) {
        await this.sendSlackNotification(ticket, 'resolved');
      }

      logger.logNotificationSent(ticket.id, 'email', true, { userId: user.id });

      return true;
    } catch (error) {
      logger.error('Notification Process Error', { 
        ticketId: ticket.id, 
        error: error.message 
      });
      logger.logNotificationSent(ticket.id, 'email', false, { error: error.message });
      return false;
    }
  }

  /**
   * Ticket'a yorum eklendiğinde bildirim gönder
   * @param {object} ticket - Ticket bilgileri
   * @param {object} user - Kullanıcı bilgileri
   * @param {string} comment - Yorum metni
   * @returns {Promise<boolean>}
   */
  async notifyCommentAdded(ticket, user, comment) {
    try {
      logger.info('Comment Notification Started', { 
        ticketId: ticket.id, 
        userId: user.id 
      });

      await this.sendEmailNotification(
        user.email,
        `Ticket #${ticket.id} Üzerine Yorum Yapıldı`,
        this.generateCommentEmailContent(ticket, comment, user)
      );

      logger.logNotificationSent(ticket.id, 'email', true, { type: 'comment' });

      return true;
    } catch (error) {
      logger.error('Comment Notification Error', { 
        ticketId: ticket.id, 
        error: error.message 
      });
      return false;
    }
  }

  /**
   * Email bildirimi gönder (Mock)
   * @param {string} to - Alıcı email
   * @param {string} subject - Konu
   * @param {string} content - İçerik
   * @returns {Promise<boolean>}
   */
  async sendEmailNotification(to, subject, content) {
    try {
      logger.debug('Email Notification Sending', { to, subject });

      // Mock email gönderimi - gerçek projede nodemailer veya benzeri kullanılacak
      // Örnek: await transporter.sendMail({ from, to, subject, html: content });

      logger.info('Email Notification Sent', { to, subject });
      return true;
    } catch (error) {
      logger.error('Email Notification Error', { to, error: error.message });
      return false;
    }
  }

  /**
   * Slack bildirimi gönder (Mock)
   * @param {object} ticket - Ticket bilgileri
   * @param {string} status - Ticket durumu
   * @returns {Promise<boolean>}
   */
  async sendSlackNotification(ticket, status) {
    try {
      logger.debug('Slack Notification Sending', { ticketId: ticket.id, status });

      // Mock Slack gönderimi - gerçek projede axios veya fetch kullanılacak
      // const response = await fetch(this.slackWebhook, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(this.generateSlackMessage(ticket, status))
      // });

      logger.info('Slack Notification Sent', { ticketId: ticket.id });
      return true;
    } catch (error) {
      logger.error('Slack Notification Error', { error: error.message });
      return false;
    }
  }

  /**
   * Email içeriği oluştur
   * @param {object} ticket - Ticket bilgileri
   * @param {string} type - Bildirim türü
   * @returns {string}
   */
  generateEmailContent(ticket, type) {
    const statusTr = {
      'open': 'Açık',
      'in_progress': 'İşleniyor',
      'resolved': 'Çözüldü',
      'closed': 'Kapalı'
    };

    const priorityTr = {
      'low': 'Düşük',
      'medium': 'Orta',
      'high': 'Yüksek'
    };

    return `
      <h2>Ticket #${ticket.id} - ${statusTr[ticket.status] || ticket.status}</h2>
      <p><strong>Başlık:</strong> ${ticket.title}</p>
      <p><strong>Açıklama:</strong> ${ticket.description}</p>
      <p><strong>Kategori:</strong> ${ticket.category || 'Belirtilmemiş'}</p>
      <p><strong>Öncelik:</strong> ${priorityTr[ticket.priority] || ticket.priority}</p>
      <p><strong>Durum:</strong> ${statusTr[ticket.status] || ticket.status}</p>
      <p><strong>Oluşturulma Tarihi:</strong> ${ticket.created_at}</p>
      <hr>
      <p>Ticket durumunuzu görmek için sisteme giriş yapabilirsiniz.</p>
    `;
  }

  /**
   * Yorum email içeriği oluştur
   * @param {object} ticket - Ticket bilgileri
   * @param {string} comment - Yorum metni
   * @param {object} user - Kullanıcı bilgileri
   * @returns {string}
   */
  generateCommentEmailContent(ticket, comment, user) {
    return `
      <h2>Ticket #${ticket.id} Üzerine Yorum Yapıldı</h2>
      <p><strong>Ticket Başlığı:</strong> ${ticket.title}</p>
      <hr>
      <p><strong>Yorum:</strong></p>
      <p>${comment}</p>
      <hr>
      <p><strong>Yorum Yapan:</strong> ${user.email}</p>
      <p>Ticket'ı görmek için sisteme giriş yapabilirsiniz.</p>
    `;
  }

  /**
   * Slack mesajı oluştur
   * @param {object} ticket - Ticket bilgileri
   * @param {string} status - Ticket durumu
   * @returns {object}
   */
  generateSlackMessage(ticket, status) {
    const statusEmoji = {
      'open': ':ticket:',
      'in_progress': ':hourglass_flowing_sand:',
      'resolved': ':white_check_mark:',
      'closed': ':x:'
    };

    return {
      text: `Ticket #${ticket.id} - ${status}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${statusEmoji[status] || ':ticket:'} *Ticket #${ticket.id}*\n*${ticket.title}*`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Kategori:*\n${ticket.category || 'Belirtilmemiş'}`
            },
            {
              type: 'mrkdwn',
              text: `*Öncelik:*\n${ticket.priority}`
            }
          ]
        }
      ]
    };
  }
}

module.exports = new NotificationService();
