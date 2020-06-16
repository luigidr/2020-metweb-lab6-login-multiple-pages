import createTasksPage from './templates/task-list-template.js';

class Filter {
    
    constructor(taskManager) {
        // reference to the task manager
        this.taskManager = taskManager;
    }

    onFilterSelected(filterType){
        const sidebarContainer = document.getElementById('left-sidebar');
        // removing and adding the 'active' class
        sidebarContainer.querySelector('a.active').classList.remove('active');
        const el = document.querySelector(`a[href='/tasks/${filterType}']`);
        el.classList.add('active');

        // properly fill up the tasks array and the page title
        let tasks = [];
        let filterTitle = '';
        
        switch(filterType){
            case 'important':
                tasks = this.taskManager.important;
                filterTitle = 'Importanti';
                break;
            case 'today':
                tasks = this.taskManager.today;
                filterTitle = 'Oggi';
                break;
            case 'week':
                tasks = this.taskManager.nextWeek;
                filterTitle = 'Prossimi 7 Giorni';
                break;
            case 'private':
                tasks = this.taskManager.private;
                filterTitle = 'Privati';
                break;
            case 'shared':
                tasks = this.taskManager.shared;
                filterTitle = 'Condivisi';
                break;
            default:
                tasks = this.taskManager.getByProject(filterType);
                filterTitle = filterType + ' - Tutti';
        }
        return {tasks: tasks, title: filterTitle} ;
    }

}

export default Filter;