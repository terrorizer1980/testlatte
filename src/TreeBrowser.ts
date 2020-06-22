import * as vscode from 'vscode';
import * as path from 'path';
import BrowserProvider from './BrowserProvider';

export default class TreeBrowser extends vscode.TreeItem {
    
    public selected: boolean;
    private selectedIcon: vscode.ThemeIcon;  
    private notSelectedIcon: vscode.ThemeIcon;

    constructor(
        label: string, 
        collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.selectedIcon = new vscode.ThemeIcon('check');
        this.notSelectedIcon = new vscode.ThemeIcon('circle-slash');

        this.selected = false;
        this.command =  {
            command: 'browserSelection.toggleSelection', 
            title: 'Select', 
            arguments: [this, ]
        };
        
        this.iconPath  = this.notSelectedIcon;
    }

    public toggleSelection() {
        this.selected = !this.selected;
        if(this.selected) {
            this.iconPath = this.selectedIcon;
        }
        else {
            this.iconPath = this.notSelectedIcon;
        }
    }
}
