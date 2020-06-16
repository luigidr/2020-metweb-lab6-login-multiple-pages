class Project {
    constructor(projectContainer, taskManager) {
        // needed references
        this.projectContainer = projectContainer;
        this.taskManager = taskManager;

    }

     /**
     * Create the list of projects in the sidebar
     */
    createAllProjects() {
        // empty the list of projects
        this.projectContainer.innerHTML = '';

        // create all the projects
        for(const project of this.taskManager.projects){
            const projectNode = this.createProjectNode(project);
            this.projectContainer.appendChild(projectNode);
        }
    }

    /**
     * Create a single project
     * @param {*} project the name of the project to be created
     */
    createProjectNode(project){
        const a = document.createElement('a');
        a.className = 'list-group-item list-group-item-action';
        a.innerText = project;
        a.href = '/tasks/' + project;
        a.title = project;
        return a;
    }
}

export default Project;
