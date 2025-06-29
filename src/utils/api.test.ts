import { analyzeCSV, generateCSV } from './api';
import { GenerateReportParams } from './apiTypes';

const mockFetch = jest.fn();
global.fetch = mockFetch;

class MockReadableStream {
  chunks: string[];
  
  constructor(chunks: string[]) {
    this.chunks = chunks;
  }

  getReader() {
    let index = 0;
    return {
      read: () => {
        if (index >= this.chunks.length) {
          return Promise.resolve({ done: true, value: undefined });
        }
        return Promise.resolve({
          done: false,
          value: new TextEncoder().encode(this.chunks[index++])
        });
      },
      cancel: jest.fn()
    };
  }
}

const createMockFile = (name = 'test.csv', content = 'data') => {
  return new File([content], name, { type: 'text/csv' });
};

describe('analyzeCSV', () => {
  const mockFile = createMockFile();

  beforeEach(() => {
    mockFetch.mockReset();
  });

  test('успешно обрабатывает CSV и возвращает аналитику', async () => {
    const stream = new MockReadableStream([
      '{"key1":"value1"}\n',
      '{"key2":"value2"}'
    ]);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: stream
    });

    const result = await analyzeCSV(mockFile);
    expect(result).toEqual({ key2: 'value2' });
  });

  test('обрабатывает ошибку сервера с JSON-ответом', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid file format' })
    });

    await expect(analyzeCSV(mockFile)).rejects.toThrow('Invalid file format');
  });

  test('обрабатывает ошибку сервера с текстовым ответом', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Server error'
    });

    await expect(analyzeCSV(mockFile)).rejects.toThrow('Server error');
  });

  test('обрабатывает пустой ответ сервера', async () => {
    const emptyStream = new MockReadableStream([]);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: emptyStream
    });

    await expect(analyzeCSV(mockFile)).rejects.toThrow('Пустой ответ от сервера');
  });

  test('обрабатывает частичные JSON в потоке', async () => {
    const stream = new MockReadableStream([
      '{"incomplete":',
      '"data"}\n{"complete":true}'
    ]);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: stream
    });

    const result = await analyzeCSV(mockFile);
    expect(result).toEqual({ complete: true });
  });

  test('передает правильные параметры в запросе', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: new MockReadableStream(['{}'])
    });

    await analyzeCSV(mockFile, 5000);
    
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/aggregate?rows=5000',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      })
    );
  });
});

describe('generateCSV', () => {
  const mockParams: GenerateReportParams = {
    size: 2,
    withErrors: 'on',
    maxSpend: 500
  };

  beforeEach(() => {
    mockFetch.mockReset();
  });

  test('успешно генерирует CSV файл', async () => {
    const mockBlob = new Blob(['test,data']);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob
    });

    const result = await generateCSV(mockParams);
    expect(result).toBeInstanceOf(Blob);
    expect(result.size).toBe(mockBlob.size);
  });

  test('обрабатывает ошибку генерации', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Generation failed'
    });

    await expect(generateCSV(mockParams)).rejects.toThrow('Generation failed');
  });

  test('использует параметры по умолчанию', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob()
    });

    const defaultParams: GenerateReportParams = {
      size: 1,
      withErrors: 'off',
      maxSpend: 1000
    };
    
    await generateCSV(defaultParams);
    
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/report?size=1&withErrors=off&maxSpend=1000',
      expect.any(Object)
    );
  });

  test('правильно формирует URL с параметрами', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob()
    });

    await generateCSV(mockParams);
    
    const expectedURL = 'http://localhost:3000/report?size=2&withErrors=on&maxSpend=500';
    expect(mockFetch).toHaveBeenCalledWith(
      expectedURL,
      expect.objectContaining({
        method: 'GET'
      })
    );
  });

  test('обрабатывает пустой текст ошибки', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => ''
    });

    await expect(generateCSV(mockParams)).rejects.toThrow('Ошибка генерации данных');
  });
});
