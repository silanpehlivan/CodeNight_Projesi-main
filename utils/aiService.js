const logger = require('./logger');

// Mock AI Service - OpenAI API'si yerine basit bir mock kullanıyoruz
// Gerçek projede: const { OpenAI } = require('openai');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || 'mock-key';
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  }

  /**
   * Ticket açıklamasından kategori önerisi üret
   * @param {string} description - Ticket açıklaması
   * @returns {Promise<{category: string, confidence: number}>}
   */
  async suggestCategory(description) {
    try {
      logger.debug('AI Category Suggestion Started', { descriptionLength: description.length });

      // Mock kategoriler - gerçek projede OpenAI API kullanılacak
      const categories = [
        { keyword: ['wifi', 'internet', 'ağ', 'bağlantı'], category: 'İnternet', confidence: 0.9 },
        { keyword: ['lms', 'sistem', 'yazılım', 'uygulama'], category: 'Bilgi İşlem', confidence: 0.85 },
        { keyword: ['yapı', 'bina', 'oda', 'onarım'], category: 'Yapı İşleri', confidence: 0.8 },
        { keyword: ['kütüphane', 'kitap', 'dokümantasyon'], category: 'Kütüphane', confidence: 0.75 },
        { keyword: ['insan kaynakları', 'hr', 'personel'], category: 'İnsan Kaynakları', confidence: 0.7 }
      ];

      const lowerDescription = description.toLowerCase();
      let bestMatch = { category: 'Diğer', confidence: 0.5 };

      for (const item of categories) {
        if (item.keyword.some(kw => lowerDescription.includes(kw))) {
          if (item.confidence > bestMatch.confidence) {
            bestMatch = { category: item.category, confidence: item.confidence };
          }
        }
      }

      logger.info('AI Category Suggestion Completed', { 
        suggestedCategory: bestMatch.category, 
        confidence: bestMatch.confidence 
      });

      return bestMatch;
    } catch (error) {
      logger.error('AI Category Suggestion Error', { error: error.message });
      return { category: 'Diğer', confidence: 0 };
    }
  }

  /**
   * Ticket açıklamasından öncelik önerisi üret
   * @param {string} description - Ticket açıklaması
   * @returns {Promise<{priority: string, confidence: number}>}
   */
  async suggestPriority(description) {
    try {
      logger.debug('AI Priority Suggestion Started', { descriptionLength: description.length });

      // Mock öncelik belirleme - gerçek projede OpenAI API kullanılacak
      const urgentKeywords = ['acil', 'urgent', 'hemen', 'immediately', 'kritik', 'critical'];
      const mediumKeywords = ['yakında', 'soon', 'bugün', 'today', 'önemli', 'important'];

      const lowerDescription = description.toLowerCase();
      let priority = 'low';
      let confidence = 0.5;

      if (urgentKeywords.some(kw => lowerDescription.includes(kw))) {
        priority = 'high';
        confidence = 0.9;
      } else if (mediumKeywords.some(kw => lowerDescription.includes(kw))) {
        priority = 'medium';
        confidence = 0.8;
      }

      logger.info('AI Priority Suggestion Completed', { 
        suggestedPriority: priority, 
        confidence 
      });

      return { priority, confidence };
    } catch (error) {
      logger.error('AI Priority Suggestion Error', { error: error.message });
      return { priority: 'medium', confidence: 0 };
    }
  }

  /**
   * Ticket için özet üret
   * @param {string} description - Ticket açıklaması
   * @returns {Promise<string>}
   */
  async generateSummary(description) {
    try {
      logger.debug('AI Summary Generation Started');

      // Mock özet - gerçek projede OpenAI API kullanılacak
      const maxLength = 150;
      let summary = description;

      if (description.length > maxLength) {
        summary = description.substring(0, maxLength) + '...';
      }

      logger.info('AI Summary Generated', { summaryLength: summary.length });

      return summary;
    } catch (error) {
      logger.error('AI Summary Generation Error', { error: error.message });
      return description.substring(0, 150);
    }
  }

  /**
   * Support personeli için cevap taslağı üret
   * @param {string} ticketDescription - Ticket açıklaması
   * @param {string} category - Ticket kategorisi
   * @returns {Promise<string>}
   */
  async generateResponseDraft(ticketDescription, category) {
    try {
      logger.debug('AI Response Draft Generation Started', { category });

      // Mock cevap taslağı - gerçek projede OpenAI API kullanılacak
      const templates = {
        'İnternet': 'Merhaba,\n\nWi-Fi bağlantı sorununuz için özür dileriz. Lütfen aşağıdaki adımları deneyin:\n1. Cihazınızı yeniden başlatın\n2. Wi-Fi ağını unutup yeniden bağlanın\n3. Sorun devam ederse IT destek ekibine başvurun\n\nYardımcı olabilir miyim?',
        'Bilgi İşlem': 'Merhaba,\n\nBilişim sistemi sorununuz için özür dileriz. Teknik ekibimiz sorunu araştırmaktadır. En kısa sürede size dönüş yapacağız.\n\nTarafınızdan başka bilgi gerekirse lütfen bildirin.',
        'Yapı İşleri': 'Merhaba,\n\nBinada oluşan sorunu bildirdiğiniz için teşekkür ederiz. Bakım ekibimiz sorunu kontrol etmek için sizinle iletişime geçecektir.\n\nTarafınızdan başka bilgi gerekirse lütfen bildirin.',
        'default': 'Merhaba,\n\nTicketiniz alınmıştır ve incelenmektedir. En kısa sürede size dönüş yapacağız.\n\nTarafınızdan başka bilgi gerekirse lütfen bildirin.'
      };

      const draft = templates[category] || templates['default'];

      logger.info('AI Response Draft Generated', { category, draftLength: draft.length });

      return draft;
    } catch (error) {
      logger.error('AI Response Draft Generation Error', { error: error.message });
      return 'Merhaba,\n\nTicketiniz alınmıştır. En kısa sürede size dönüş yapacağız.';
    }
  }
}

module.exports = new AIService();
