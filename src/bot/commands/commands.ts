interface Commands {
    command: string;
    description: string;
}

export const COMMANDS: Commands[] = [
    { command: 'start', description: "Розпочати вза'ємодію з ботом" },
    { command: 'changename', description: "Змінити Ім'я та Прізвище" },
    { command: 'cancel', description: 'Достроково завершити розмову' },
    { command: 'help', description: "Допомога у розв'язанні проблем" },
    { command: 'about', description: "Детально про бота" },
];
