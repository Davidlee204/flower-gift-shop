import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 1. Import các file ngôn ngữ bạn đã tạo trong thư mục locales
import viTranslation from './locales/vi.json';
import enTranslation from './locales/en.json';

i18n
  .use(initReactI18next) // Kết nối i18next với react-i18next
  .init({
    resources: {
      vi: {
        translation: viTranslation
      },
      en: {
        translation: enTranslation
      }
    },
    lng: 'vi', // Ngôn ngữ mặc định khi vừa mở web
    fallbackLng: 'vi', // Ngôn ngữ dự phòng nếu không tìm thấy bản dịch
    interpolation: {
      escapeValue: false // React đã tự động bảo vệ khỏi XSS
    }
  });

export default i18n;