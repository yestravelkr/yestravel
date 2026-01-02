/**
 * 문자열 치환 유틸리티
 * #{변수명} 패턴을 실제 값으로 치환
 */
export function replaceString(
  template: string,
  replaces: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(replaces)) {
    result = result.replace(new RegExp(`#\\{${key}\\}`, 'g'), value);
  }
  return result;
}
