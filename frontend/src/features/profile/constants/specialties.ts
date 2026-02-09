/**
 * Список IT-специальностей (из плана 2-User_Profile_and_Role_Selection.md).
 * Поиск по русскому и английскому названию.
 */
export const SPECIALTIES = [
  { value: 'Frontend-разработчик', search: 'Frontend frontend' },
  { value: 'Backend-разработчик', search: 'Backend backend' },
  { value: 'Fullstack-разработчик', search: 'Fullstack fullstack' },
  { value: 'Java-разработчик', search: 'Java java' },
  { value: 'Python-разработчик', search: 'Python python' },
  { value: 'Mobile-разработчик (iOS / Android)', search: 'Mobile iOS Android mobile' },
  { value: 'QA Engineer (Manual / Automation)', search: 'QA Engineer Manual Automation qa' },
  { value: 'Системный аналитик (SA)', search: 'Системный аналитик SA' },
  { value: 'Бизнес-аналитик (BA)', search: 'Бизнес-аналитик BA' },
  { value: 'Product Manager (PM)', search: 'Product Manager PM product' },
  { value: 'Data Analyst', search: 'Data Analyst data analyst' },
  { value: 'Data Scientist', search: 'Data Scientist data scientist' },
  { value: 'DevOps-инженер', search: 'DevOps devops' },
  { value: 'UI/UX Designer', search: 'UI UX Designer designer' },
  { value: 'Архитектор (Software Architect)', search: 'Архитектор Software Architect architect' },
] as const;

export type SpecialtyValue = (typeof SPECIALTIES)[number]['value'];
