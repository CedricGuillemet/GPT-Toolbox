# GPT-Toolbox
GPT extension for VSCode. 
Generic interface and queries to use with Chat-GPT.
Main feature is documenting selected code.
With more functionalities expected to land in this project.

## Running this extension

- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window

## Settings
Add your own ChatGPT API Key and an optional hint to help ChatGPT generate the comment.
Go to VSCode preferences:

![VSCode preferences](Images/pref.png)

Then fill the API key that you can get from https://beta.openai.com/account/api-keys

![VSCode preferences](Images/settings.png)

## How to use

Select your Typescript code in VScode then right click and select 'GPT Toolbox - Document code'

![VSCode preferences](Images/selectCode.png)

After a few seconds, the documentation comment is there.

![VSCode preferences](Images/resultDoc.png)