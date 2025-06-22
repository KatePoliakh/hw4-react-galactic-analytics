/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AnalyticsResponse, GenerateReportParams } from "./apiTypes";

const API_URL = 'http://localhost:3000';

export const analyzeCSV = async (file: File, rows: number = 10000): Promise<AnalyticsResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/aggregate?rows=${rows}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Ошибка анализа CSV';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      const text = await response.text();
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let lastChunk = null;

  while (true) {
    const { done, value } = await reader?.read() || { done: true, value: undefined };
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        try {
          lastChunk = JSON.parse(line);
        } catch (e) {
          console.warn('Ошибка парсинга строки:', line);
        }
      }
    }
  }

  if (buffer.trim()) {
    try {
      lastChunk = JSON.parse(buffer);
    } catch (e) {
      console.warn('Незавершенная строка:', buffer);
    }
  }

  if (!lastChunk) throw new Error('Пустой ответ от сервера');

  return lastChunk;
};

export const generateCSV = async ({
  size = 1,
  withErrors = 'off',
  maxSpend = 1000
}: GenerateReportParams): Promise<Blob> => {
  const params = new URLSearchParams({
    size: size.toString(),
    withErrors,
    maxSpend: maxSpend.toString()
  });

  const response = await fetch(`${API_URL}/report?${params.toString()}`, {
    method: 'GET'
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Ошибка генерации данных');
  }

  return response.blob();
};