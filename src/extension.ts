import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "sortify" is now active!');

    // Register the sort imports command
    let disposable = vscode.commands.registerCommand('sortify.sortImports', async () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found.');
            return;
        }

        const document = editor.document;

        // Get the entire text of the document
        const text = document.getText();

        // Split the text into lines
        const lines = text.split('\n');

        // Ask the user if they want to preserve comments
        const preserveComments = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: 'Do you want to preserve imports under their respective comments?',
        });

        if (preserveComments === undefined) {
            vscode.window.showInformationMessage('Sorting canceled by the user.');
            return; // User canceled the prompt
        }

        let sortedText: string;

        if (preserveComments === 'Yes') {
            // Preserve imports under their respective comments
            const blocks: { comment: string; imports: string[]; nonImportLines: string[] }[] = [];
            let currentComment: string | null = null;
            let currentImports: string[] = [];
            let currentNonImportLines: string[] = [];

            for (const line of lines) {
                const trimmedLine = line.trim(); // Store trimmed line to avoid repeated calls

                if (trimmedLine.startsWith('//')) {
                    // If we encounter a new comment, save the previous block
                    if (currentComment !== null) {
                        blocks.push({ comment: currentComment, imports: currentImports, nonImportLines: currentNonImportLines });
                    }
                    currentComment = line;
                    currentImports = [];
                    currentNonImportLines = [];
                } else if (trimmedLine.startsWith('import')) {
                    currentImports.push(line);
                } else {
                    currentNonImportLines.push(line);
                }
            }

            // Save the last block if it exists
            if (currentComment !== null) {
                blocks.push({ comment: currentComment, imports: currentImports, nonImportLines: currentNonImportLines });
            }

            // Sort imports within each block
            for (const block of blocks) {
                if (block.imports.length > 1) {
                    block.imports.sort(); // Only sort if there are multiple imports
                }
            }

            // Reconstruct the sorted text
            sortedText = blocks
                .map(block => [block.comment, ...block.imports, ...block.nonImportLines].join('\n'))
                .join('\n');
        } else {
            // Group all imports into one big block and sort
            const importLines = lines.filter(line => line.trim().startsWith('import'));
            const nonImportLines = lines.filter(
                line => !line.trim().startsWith('import') && !line.trim().startsWith('//') && line.trim() !== ''
            );

            // Sort imports alphabetically
            const sortedImports = importLines.sort();

            // Reconstruct the text with sorted imports at the top
            sortedText = [...sortedImports, '', ...nonImportLines].join('\n');
        }

        // Replace the entire document text with the sorted text
        await editor.edit(editBuilder => {
            const firstLine = document.lineAt(0);
            const lastLine = document.lineAt(document.lineCount - 1);
            const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
            editBuilder.replace(textRange, sortedText);
        });

        vscode.window.showInformationMessage('Imports sorted successfully!');
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
