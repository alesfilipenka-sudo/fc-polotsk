// Страховка для side-effect импортов стилей (`import "./globals.css"`).
// Next.js обычно даёт эти типы через next/image-types и внутренние
// декларации, но VS Code иногда не подхватывает их до первого билда.
// Этот файл гарантирует что TS Server видит нужные типы всегда.

declare module "*.css";
declare module "*.scss";
declare module "*.sass";
