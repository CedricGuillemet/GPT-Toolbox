'use strict';

import * as vscode from 'vscode';
import { window, ProgressLocation } from 'vscode';
import * as https from 'https';

async function runOpenAIQuery(prompt: string, code: string, apiKey: any) {

	let hostname = vscode.workspace.getConfiguration().get('gpttoolbox.hostname');
	let port = vscode.workspace.getConfiguration().get('gpttoolbox.port');
	let path = vscode.workspace.getConfiguration().get('gpttoolbox.path');

	hostname = hostname ? hostname: 'api.openai.com';
	port = port ? port : 443;
	path = path ? path :'/v1/completions';

	const options = {
		hostname: hostname,
		port: port,
		path: path,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`
		}
	};
	let responseData = '';
	let statusCode = 0;

	const req = https.request(options as any, (res: any) => {
		statusCode = res.statusCode;

		res.on('data', (d: any) => {
			responseData += d;
		});
	});

	req.on('error', (error: any) => {
		console.error(error);
	});

	req.write(JSON.stringify({
		model: 'text-davinci-003',
		prompt: prompt + code,
		max_tokens: 2048,
		temperature: 0.0,
		top_p: 0.1
	}));
	req.end();

	await new Promise(resolve => req.on('close', resolve));

	if (statusCode == 401) {
		throw new Error('The API key provided is not valid. Please check the key and try again.');
	}

	return JSON.parse(responseData);
}

export function activate(context: vscode.ExtensionContext) {
	const api_key = vscode.workspace.getConfiguration().get('gpttoolbox.apiKey');
	const code_context = vscode.workspace.getConfiguration().get('gpttoolbox.context');
	const disposable = vscode.commands.registerCommand('extension.gpttoolbox', async function() {

		if (!api_key) {
			throw new Error('API key is required and cannot be empty');
		}

		let context_infos = "";
		if (code_context)
		{
			context_infos = "The code is about "+code_context+".";
		}

		// Get the active text editor
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			window.withProgress({
				location: ProgressLocation.Notification,
				title: "Generating documentation",
				cancellable: false
			}, (progress, token) => {

				token.onCancellationRequested(() => {
					console.log("User canceled the long running operation");
				});

				progress.report({ message: "Sending request! almost there...", increment: 10 });
				const document = editor.document;
				const selection = editor.selection;

				// Get the word within the selection
				const code = document.getText(selection);

				//It's in the context of a physics engine in babylon.js. 
				const p = new Promise<void>(resolve => {
					runOpenAIQuery(
						`Generate documentation comment following TSDoc specification with input parameters and return value for the following code. Also add detailed explanation in the comment on why this code is useful. ${context_infos} Format the generated comment with 80 columns view:\n`
						, code
						, api_key).then((res: any)=> {
							if (res['error']) {
								vscode.window.showErrorMessage(res['error']['message']);
								resolve();
								return;
							}
							const comment = res["choices"][0]["text"];
							editor.edit(editBuilder => {

								progress.report({ message: "Done!", increment: 90 });

								editBuilder.replace(selection, comment + "\n" + code);
								resolve();
							});
						});
					});
		
				return p;
			});
		}
	});

	context.subscriptions.push(disposable);
}