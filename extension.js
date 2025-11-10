// Подключаем API VS Code, чтобы работать с редактором, командами и UI
const vscode = require('vscode');

// Функция, которую вызывает VS Code при активации расширения
// Активация происходит согласно событиям из package.json → activationEvents
function activate(context) {
    // Регистрация команды с идентификатором 'cleanCppComments.clean'
    // Этот ID должен совпадать с contributes.commands[].command в package.json
    let disposable = vscode.commands.registerCommand('cleanCppComments.clean', function () {
    // Получение текущего активного редактора. Если файла нет — сообщаем и выходим.
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('Нет открытого файла!');
        return;
    }

    // Показываем пользователю выбор — какой тип комментариев удалить
    vscode.window.showQuickPick(['Удалить // комментарии', 'Удалить /* ... */ комментарии', 'Удалить все комментарии'],{ placeHolder: 'Выбери тип комментариев для удаления' }).then(function(choice) {
        // Если пользователь отменил выбор — ничего не делаем
        if (!choice) return;

        // Считываем весь текст текущего документа
        const text = editor.document.getText();
        // Будущая версия текста после очистки комментариев
        let newText = text;

        // Если выбран пункт с // — удаляем однострочные комментарии вида // до конца строки
        // Регулярное выражение:
        //   /\/\/.*$/gm
        //   //  — собственно начало комментария
        //   .* — все символы до конца строки
        //   $  — конец строки
        //   g  — глобальный поиск по всему документу
        //   m  — многострочный режим (^ и $ работают построчно)
        if (choice.includes('//')) {
            newText = newText.replace(/\/\/.*$/gm, '');
        }

        // Если выбран пункт с /* ... */ — удаляем многострочные комментарии
        // Регулярное выражение:
        //   /\/\*[\s\S]*?\*\//g
        //   \/\*     — начало комментария
        //   [\s\S]*? — ленивое (минимальное) совпадение любых символов, включая переводы строк
        //   \*\/     — конец комментария
        //   g        — глобальный поиск
        if (choice.includes('/*')) {
            newText = newText.replace(/\/\*[\s\S]*?\*\//g, '');
        }

        // Если выбран пункт «все» — удаляем и однострочные, и многострочные комментарии
        if (choice.includes('все')) {
            newText = text.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        }

        // Вносим изменения в документ одной правкой:
        //   — получаем диапазон от начала первой строки до конца последней
        //   — заменяем его текст на обновлённый без комментариев
        editor.edit(function(editBuilder) {
            // Первая строка документа
            const firstLine = editor.document.lineAt(0);
            // Последняя строка документа
            const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
            // Полный диапазон документа
            const fullRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
            // Замена всего текста
            editBuilder.replace(fullRange, newText);
        });

        // Показываем уведомление об успешном удалении комментариев
        vscode.window.showInformationMessage('Комментарии удалены!');
        });
    });

    // Добавляем зарегистрированную команду в подписки контекста,
    // чтобы VS Code корректно очистил ресурсы при деактивации
    context.subscriptions.push(disposable);
}

// Функция,которая вызывается при деактивации расширения
function deactivate() {}

module.exports = {
    activate,
    deactivate
};