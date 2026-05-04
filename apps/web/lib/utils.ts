/**
 * Tiny class-merge helper. Avoids pulling in clsx/tailwind-merge for the shell.
 */
export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}
