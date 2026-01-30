import { PrismaClient, LogLevel, LogSource } from '@prisma/client';

// 'db.ts' dosyasından mevcut Prisma istemcisini alıyoruz
import prisma from './db'; 

// İstemci tarafında API'ye istek atmak için
const API_ENDPOINT = '/api/logs';

// Logger'ın temel yapısı
interface ILogger {
  log(level: LogLevel, message: string, meta?: Record<string, any>): Promise<void>;
  info(message: string, meta?: Record<string, any>): Promise<void>;
  warn(message: string, meta?: Record<string, any>): Promise<void>;
  error(message: string, meta?: Record<string, any>): Promise<void>;
  audit(message: string, meta?: Record<string, any>): Promise<void>;
}

// Sunucu tarafında çalışacak logger
const createServerLogger = (source: LogSource): ILogger => ({
  async log(level: LogLevel, message: string, meta: Record<string, any> = {}) {
    try {
      await prisma.systemLog.create({
        data: {
          level,
          message,
          meta,
          source,
        },
      });
    } catch (error) {
      console.error("Failed to write log to database:", error);
    }
  },
  info(message, meta) {
    return this.log('INFO', message, meta);
  },
  warn(message, meta) {
    return this.log('WARN', message, meta);
  },
  error(message, meta) {
    return this.log('ERROR', message, meta);
  },
  audit(message, meta) {
    return this.log('AUDIT', message, meta);
  },
});

// İstemci tarafında çalışacak logger
const createClientLogger = (): ILogger => ({
  async log(level: LogLevel, message: string, meta?: Record<string, any>) {
    try {
      await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message, meta }),
      });
    } catch (error) {
      console.error("Failed to send log to server:", error);
    }
  },
  info(message, meta) {
    return this.log('INFO', message, meta);
  },
  warn(message, meta) {
    return this.log('WARN', message, meta);
  },
  error(message, meta) {
    return this.log('ERROR', message, meta);
  },
  audit(message, meta) {
    return this.log('AUDIT', message, meta);
  },
});

// Ana factory fonksiyonu
// Bu fonksiyon, kodun nerede çalıştığını kontrol eder ve uygun logger'ı döndürür.
export const createLogger = (source: LogSource = 'SERVER'): ILogger => {
  if (typeof window === 'undefined') {
    // Sunucu tarafı
    return createServerLogger(source);
  } else {
    // İstemci tarafı
    return createClientLogger();
  }
};

// Varsayılan bir sunucu logger'ı ihraç edelim (sunucu tarafı modüllerde doğrudan kullanım için)
export const serverLogger = createLogger('SERVER');
