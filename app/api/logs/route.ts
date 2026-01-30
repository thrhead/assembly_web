import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createLogger } from '@/lib/logger'; // Bunu bir sonraki adımda oluşturacağız

// Gelen isteğin gövdesi için bir Zod şeması tanımlıyoruz.
// Bu, veri bütünlüğünü ve güvenliği sağlar.
const logSchema = z.object({
  level: z.enum(['INFO', 'WARN', 'ERROR', 'AUDIT']),
  message: z.string(),
  meta: z.record(z.any()).optional(), // Esnek bir JSON nesnesi için
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = logSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid log payload', errors: validation.error.format() },
        { status: 400 }
      );
    }

    // Logger'ı 'CLIENT' kaynağı ile çağırıyoruz.
    const logger = createLogger('CLIENT');
    const { level, message, meta } = validation.data;

    // Logu kaydet
    await logger.log(level, message, meta);

    return NextResponse.json({ message: 'Log received' }, { status: 201 });
  } catch (error) {
    console.error('[LOG API] Failed to process log:', error);
    // Burada kendi kendini loglamaktan kaçınmalıyız. Sadece konsola yazdırıyoruz.
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
