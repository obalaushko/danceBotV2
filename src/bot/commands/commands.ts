interface Commands {
    command: string;
    description: string;
}

export const COMMANDS: Commands[] = [
    { command: 'start', description: "Розпочати вза'ємодію з ботом" },
    { command: 'help', description: "Допомога у розв'язанні проблем" },
    { command: 'cancel', description: 'Достроково завершити розмову' },
    { command: 'changename', description: "Змінити Ім'я та Прізвище" },
];
