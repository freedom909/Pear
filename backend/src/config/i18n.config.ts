import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import { Request, Response, NextFunction } from 'express';

// Initialize i18n
i18next
  .use(Backend)
  .init({
    fallbackLng: 'en-US',
    preload: ['en-US', 'zh-CN'],
    ns: ['errors'],
    defaultNS: 'errors',
    backend: {
      loadPath: 'locales/{{lng}}.json',
    },
    interpolation: {
      escapeValue: false,
    }
  });

// Express middleware to handle language detection
export const i18nMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const lang = req.acceptsLanguages(['en-US', 'zh-CN']) || 'en-US';
  i18next.changeLanguage(lang);
  next();
};

export default i18next;