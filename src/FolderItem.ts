import * as vscode from 'vscode';
import TestItem from './TestItem';
import Util from './Util';

interface FileTests {
    filePath: string;
    testsData: any[];
}

export default class FolderItem extends vscode.TreeItem {
    public folder: vscode.WorkspaceFolder;

    constructor (
        label: string,
        collapsibleState: vscode.TreeItemCollapsibleState,
        folder: vscode.WorkspaceFolder
    ) {
        super(label, collapsibleState);
        this.folder = folder;
        this.contextValue = 'FolderItem';
    }

    public getTestList(): Promise<vscode.TreeItem[]> {
        return new Promise ((resolve) => {
            this.getFilePaths().then(
                result =>  {
                    var promises = [];
                    for (const file of result) {
                        promises.push(this.getFileTests(file.fsPath));
                    }
                    Promise.all(promises).then(
                        result => {
                            let foundTest = false;

                            let testList: vscode.TreeItem[] = [];
                            for (const testsData of result) {
                                for(const test of testsData.testsData) {
                                    foundTest = true;
                                    testList.push(new TestItem(test.name,vscode.TreeItemCollapsibleState.Collapsed, test, testsData.filePath, this.folder));
                                }
                            }
                            if(!foundTest) {
                                let notFoundList: vscode.TreeItem[] = [new vscode.TreeItem('No test found.', vscode.TreeItemCollapsibleState.None)];
                                resolve(notFoundList);
                            }
                            else {
                                resolve(testList);
                            }
                        }
                    );
                }
            );
        });
    }

    private getFilePaths(): Thenable<vscode.Uri[]> {
        let configuredPath: string = Util.getConfiguredFilePath(this.folder);
        let relativePattern: vscode.RelativePattern = new vscode.RelativePattern(this.folder, configuredPath + '**/*.*');
        return (vscode.workspace.findFiles(relativePattern, 'node_modules'));
    }

    private async getFileTests(file: string): Promise<FileTests> {
        let embeddingUtils = require('testcafe').embeddingUtils;

        let testList: FileTests = {
            filePath: file,
            testsData: []
        };

        let path = require('path');
        let extension = path.extname(file);
        try {
            if(extension === '.ts') {
                testList = await embeddingUtils.getTypeScriptTestList(file).then((result: any[]) => {
                    let fileTests: FileTests = {
                        filePath: file,
                        testsData: result
                    };
                    return fileTests;
                });
            }
            else {
                testList = await embeddingUtils.getTestList(file).then((result: any[]) => {
                    let fileTests: FileTests = {
                        filePath: file,
                        testsData: result
                    };
                    return fileTests;
                });
            }
        }
        catch(e) {
            console.log(e);
        }

        return Promise.resolve(testList);
    }
}