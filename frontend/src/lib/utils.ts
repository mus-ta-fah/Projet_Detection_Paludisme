import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";
import { AxiosError } from "axios";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr = "PPp") {
  return format(new Date(date), formatStr);
}

export function formatPercentage(value: number, decimals = 2) {
  return `${value.toFixed(decimals)}%`;
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getConfidenceColor(confidence: number) {
  if (confidence >= 90) return 'text-green-600 dark:text-green-400';
  if (confidence >= 75) return 'text-blue-600 dark:text-blue-400';
  if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function getPredictionColor(isParasitized: boolean) {
  return isParasitized 
    ? 'text-red-600 dark:text-red-400' 
    : 'text-green-600 dark:text-green-400';
}

export function downloadAsJSON(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getImageUrl(filename: string) {
  return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${filename}`;
}

export function getAxiosErrorMessage(error: unknown) {
  if (error instanceof AxiosError && error.response?.data?.detail) {
    return error.response?.data?.detail as string;
  }
  return 'An unknown error occurred';
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}