const vscode = require('vscode');

function activate(context) {
    let disposable = vscode.commands.registerCommand('cleanCppComments.clean', function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('Нет открытого файла!');
        return;
    }

    vscode.window.showQuickPick(['Удалить // комментарии', 'Удалить /* ... */ комментарии', 'Удалить все комментарии'],{ placeHolder: 'Выбери тип комментариев для удаления' }).then(function(choice) {
        if (!choice) return;

        const text = editor.document.getText();
        let newText = text;

        if (choice.includes('//')) {
            newText = newText.replace(/\/\/.*$/gm, '');
        }

        if (choice.includes('/*')) {
            newText = newText.replace(/\/\*[\s\S]*?\*\//g, '');
        }

        if (choice.includes('все')) {
            newText = text.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        }

        editor.edit(function(editBuilder) {
            const firstLine = editor.document.lineAt(0);
            const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
            const fullRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
            editBuilder.replace(fullRange, newText);
        });

        vscode.window.showInformationMessage('Комментарии удалены!');
        });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
