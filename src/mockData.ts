import type { User, Project } from './types';
import { format, subDays } from 'date-fns';

// Проекты
export const mockProjects: Project[] = [
  { id: 1, name: 'E-commerce Platform', color: '#1976d2' },
  { id: 2, name: 'Mobile Banking', color: '#388e3c' },
  { id: 3, name: 'CRM System', color: '#f57c00' },
  { id: 4, name: 'Analytics Dashboard', color: '#7b1fa2' },
];

// Генерируем случайные часы работы (от 0 до 12 часов в день)
const generateRandomHours = (): number => {
  const possibilities = [0, 0, 0, 2, 4, 6, 8, 8, 8, 8, 10, 12]; // больше вероятности для полного рабочего дня
  return possibilities[Math.floor(Math.random() * possibilities.length)];
};

// Генерируем данные за последние 60 дней
const generateTimeEntries = () => {
  const entries = [];
  const today = new Date();
  
  for (let i = 364; i >= 0; i--) {
    const date = subDays(today, i);
    const dateString = format(date, 'yyyy-MM-dd');
    const hours = generateRandomHours();
    
    entries.push({
      date: dateString,
      hours: hours
    });
  }
  
  return entries;
};

// Список имен для пользователей
const userNames = [
  'Алексей Иванов',
  'Мария Петрова',
  'Дмитрий Сидоров',
  'Екатерина Козлова',
  'Сергей Морозов',
  'Анна Волкова',
  'Павел Новиков',
  'Ольга Соколова',
  'Николай Лебедев',
  'Татьяна Попова',
  'Владимир Васильев',
  'Елена Зайцева',
  'Артем Федоров',
  'Юлия Михайлова',
  'Максим Жуков',
  'Светлана Крылова',
  'Игорь Комаров',
  'Наталья Орлова',
  'Андрей Макаров',
  'Виктория Белова',
  'Денис Смирнов',
  'Ирина Кузнецова',
  'Роман Ковалев',
  'Галина Никитина',
  'Станислав Григорьев',
  'Людмила Романова',
  'Евгений Степанов',
  'Оксана Захарова',
  'Константин Борисов',
  'Вера Алексеева',
  'Илья Тихонов',
  'Марина Егорова',
  'Руслан Киселев',
  'Лариса Матвеева',
  'Кирилл Воронов',
  'Инна Гончарова',
  'Вячеслав Медведев',
  'Регина Калинина',
  'Олег Марков',
  'Нина Фролова'
];

// Генерируем 40 пользователей с моковыми данными, распределяя их по проектам
export const mockUsers: User[] = userNames.map((name, index) => {
  // Распределяем пользователей равномерно по проектам
  const projectId = (index % mockProjects.length) + 1;
  
  return {
    id: `user-${index + 1}`,
    name: name,
    projectId: projectId,
    timeEntries: generateTimeEntries()
  };
});
