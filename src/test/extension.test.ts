import * as assert from 'assert';
import * as vscode from 'vscode';
import { activate } from '../extension';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Sort Imports - Preserve Comments (Yes)', async () => {
        // Create a new text document
        const document = await vscode.workspace.openTextDocument({
            content: `// These are important imports\nimport fs from 'fs';\nimport path from 'path';\n\n// Utility imports\nimport os from 'os';\n\nconsole.log('Hello, world!');`,
            language: 'javascript',
        });

        // Open the document in the editor
        const editor = await vscode.window.showTextDocument(document);

        // Set the editor's selection (optional)
        editor.selection = new vscode.Selection(0, 0, 0, 0);

        // Mock the user's choice (Yes)
        const mockShowQuickPick = async () => 'Yes';
        (vscode.window.showQuickPick as any) = mockShowQuickPick;

        // Run the command
        await vscode.commands.executeCommand('sortify.sortImports');

        // Get the updated text
        const sortedText = editor.document.getText();

        // Expected output
        const expectedText = `// These are important imports\nimport fs from 'fs';\nimport path from 'path';\n\n// Utility imports\nimport os from 'os';\n\nconsole.log('Hello, world!');`;

        // Assert the result
        assert.strictEqual(sortedText, expectedText);
    });

	test('Sort Imports - Group All Imports (No)', async () => {
		// Create a new text document
		const document = await vscode.workspace.openTextDocument({
			content: `// These are important imports\nimport fs from 'fs';\nimport path from 'path';\n\n// Utility imports\nimport os from 'os';\n\nconsole.log('Hello, world!');`,
			language: 'javascript',
		});

		// Open the document in the editor
		const editor = await vscode.window.showTextDocument(document);

		// Set the editor's selection (optional)
		editor.selection = new vscode.Selection(0, 0, 0, 0);

		// Mock the user's choice (No)
		const mockShowQuickPick = async () => 'No';
		(vscode.window.showQuickPick as any) = mockShowQuickPick;

		// Run the command
		await vscode.commands.executeCommand('sortify.sortImports');

		// Get the updated text
		const sortedText = editor.document.getText();

		// Expected output
		const expectedText = `import fs from 'fs';\nimport os from 'os';\nimport path from 'path';\n\nconsole.log('Hello, world!');`;

		// Assert the result
		assert.strictEqual(sortedText, expectedText);
	});
});