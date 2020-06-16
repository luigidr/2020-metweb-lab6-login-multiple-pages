import TaskManager from './task-manager.js';
import Filter from './filters.js';
import Project from './projects.js';
import createAddForm from './templates/form-template.js';
import createTasksPage from './templates/task-list-template.js';
import Task from './task.js';
import Api from './api.js';
import createLoginForm from './templates/login-template.js';
import createAlert from './templates/alert-template.js';
import {createLogin, createUser} from './templates/nav-template.js';
import page from '//unpkg.com/page/page.mjs';

class App {
    constructor(appContainer, userContainer) {
        // reference to the task list container
        this.appContainer = appContainer;
        // reference to the user/login area in the navbar
        this.userContainer = userContainer;

        // init the task manager
        this.taskManager = new TaskManager();

        // routing
        page('/', () => {
            page('/tasks');
        });
        page('/tasks', (ctx) => {
            this.showAllTasks(ctx.path);
        });
        page('/tasks/:filter', (ctx) => {
            this.showFilteredTasks(ctx.params.filter, ctx.path);
        });
        page('/tasks/:id/edit', (ctx) => {
            this.showAddEditForm(ctx.params.id);
        });
        page('/add', () => {
            this.showAddEditForm();
        });
        page('/login', () => {
            this.userContainer.innerHTML = createLogin();
            this.appContainer.insertAdjacentHTML('beforeend', createLoginForm());
            document.getElementById('login-form').addEventListener('submit', this.onLoginSubmitted);
        });
        page();
    }

    /**
     * Common functionality for many pages
     */
    init = async () => {
        this.userContainer.innerHTML = createUser();
        this.appContainer.innerHTML = createTasksPage();

        // get all tasks
        await this.taskManager.getAllTasks();
        
        // init the project functionality
        const projectContainer = document.getElementById('projects');
        this.projects = new Project(projectContainer, this.taskManager);
        this.projects.createAllProjects();

    }

    /**
     * Show all tasks
     * @param {*} path the current path (URL)
     */
    showAllTasks = async (path) => {
        try {
            await this.init();
            this.showTasks(this.taskManager.tasks, path);
        }
        catch(err) {
            page('/login');
        }
    }

    /**
     * Show filtered tasks
     * @param {*} filter the current filter
     * @param {*} path the current path (URL)
     */
    showFilteredTasks = async (filter, path) => {
        await this.init();

        const filters = new Filter(this.taskManager);
        const {tasks, title} = filters.onFilterSelected(filter);

        // set the page title
        const pageTitle = document.getElementById('filter-title');
        pageTitle.innerText = title;

        // show all the things!
        this.showTasks(tasks, path);
    }

    /**
     * Handling the form submission: edit and add
     * @param {*} event the submission event
     */
    onFormSubmitted = (event) => {
        event.preventDefault();
        const addForm = document.getElementById('add-form');

        const description = addForm.elements['form-description'].value;

        let project = addForm.elements['form-project'].value;
        if(project === '')
            project = undefined;

        const important = addForm.elements['form-important'].checked;
        const privateTask = addForm.elements['form-private'].checked;
        
        const deadlineDate = addForm.elements['form-deadline-date'].value;
        const deadlineTime = addForm.elements['form-deadline-time'].value;
        
        let deadline = undefined;
        if(deadlineDate !== '' && deadlineTime !== '')
            deadline = deadlineDate + ' ' + deadlineTime;
        else if(deadlineDate !== '')
            deadline = deadlineDate;

        if(addForm.elements['form-id'].value && addForm.elements['form-id'].value !== ""){
            //there is a task id -> update
            const id = addForm.elements['form-id'].value;
            const task = new Task(id, description, important, privateTask, deadline, project);
            this.taskManager.updateTask(task) 
                .then(() => {     
                    //reset the form and go back to the home
                    addForm.reset();
                    page('/');
                })
                .catch((error) => {
                    // add an alert message in DOM
                    document.getElementById('error-messages').innerHTML = createAlert('danger', error);
                    }
                );
        } else {
            //the id is empty -> add
            const task = new Task(undefined, description, important, privateTask, deadline, project);
            
            this.taskManager.addTask(task).then(() => {
                page('/');
            });
        }
    }

    /**
     * Handle the form for adding or editing a task
     * @param {*} id the task id
     */
    showAddEditForm = async (id) => {
        // add the form
        this.appContainer.innerHTML = createAddForm();

        if(id !== undefined) {
            if(this.taskManager.tasks.length === 0)
                await this.taskManager.getAllTasks();

            const task = this.taskManager.tasks[id-1];
            const addForm = document.getElementById('add-form');
            addForm.elements['form-id'].value = task.id;
            addForm.elements['form-description'].value = task.description;
            addForm.elements['form-project'].value = task.project;
            if(task.important)
                addForm.elements['form-important'].checked = true;
            else
                addForm.elements['form-important'].checked = false;
            if(task.privateTask)
                addForm.elements['form-private'].checked = true; 
            else
                addForm.elements['form-private'].checked = false; 

            if(task.deadline) {
                addForm.elements['form-deadline-date'].value = task.deadline.format('YYYY-MM-DD');
                addForm.elements['form-deadline-time'].value = task.deadline.format('hh:mm');
            }
        }

        // set up custom validation callback
        // -> if I insert a time for the deadline, then the date is required
        const timeInput = document.getElementById('form-deadline-time');
        const dateInput = document.getElementById('form-deadline-date');
        timeInput.addEventListener('input', function(){
            if(timeInput.value !== ''){
                // check date
                if(dateInput.value === ''){
                    dateInput.setCustomValidity('Data mancante, per favore, specificala');
                    dateInput.classList.add('invalid');
                }
            } else {
                dateInput.setCustomValidity('');
                dateInput.classList.remove('invalid');
            }
        });
        dateInput.addEventListener('input', function(){
            if(dateInput.value !== '')
                dateInput.setCustomValidity('');
        });

        // set up form callback
        document.getElementById('add-form').addEventListener('submit', this.onFormSubmitted);
    }

    /**
     * Create the <ul></ul> list of tasks
     * 
     * @param {*} tasks the task list to display
     */
    showTasks(tasks, path){
        // welcome the user, the first time
        const user = localStorage.getItem('user');
        if(user !== null) {
            // welcome the user
            document.getElementById('error-messages').innerHTML = createAlert('success', `Welcome ${user}!`);
            // automatically remove the flash message after 3 sec
            setTimeout(() => {
                document.getElementById('error-messages').innerHTML = '';
            }, 3000);
            localStorage.clear();
        }

        let taskContainer = document.getElementById('task-list');
        
        for(const task of tasks){
            const taskNode = this.createTaskNode(task, path);
            taskContainer.appendChild(taskNode);
        }
    }

    /**
     * Function to create a single task enclosed in an <li> tag
     * @param {*} task the task object
     */
    createTaskNode(task, path){
        const li = document.createElement('li');
        li.id = 'task' + task.id;
        li.className = 'list-group-item';
        const innerDiv = document.createElement('div');
        innerDiv.className = 'custom-control custom-checkbox';
        const externalDiv = document.createElement('div');
        externalDiv.className = 'd-flex w-100 justify-content-between';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'custom-control-input';
        checkbox.id = 'check-t' + task.id;
        if(task.completed)
            checkbox.checked = true;
        else 
            checkbox.checked = false;

        // event listener to mark the task as completed (or not completed)
        checkbox.addEventListener('change', event => {
            if(event.target.checked)
                task.completed = true;
            else 
                task.completed = false;

            this.taskManager.updateTask(task)
            .then(() => {
                page(path);
            })
            .catch((error) => {
                    // add an alert message in DOM
                    document.getElementById('error-messages').innerHTML = createAlert('danger', error);
            });

        });

        innerDiv.appendChild(checkbox);
        
        const descriptionText = document.createElement('label');
        descriptionText.className = 'description custom-control-label';
        descriptionText.htmlFor = 'check-t' + task.id;

        if(task.important) {
            const importantSpan = document.createElement('span');
            importantSpan.className = 'text-danger pr-1';
            importantSpan.innerText = '!!!';
            descriptionText.appendChild(importantSpan);
        }
        descriptionText.innerHTML += task.description;
        
        innerDiv.appendChild(descriptionText);
        
        if(task.project){
            const projectText = document.createElement('span');
            projectText.className = 'project badge badge-primary ml-4';
            projectText.innerText = task.project;
            innerDiv.appendChild(projectText);
        }
        externalDiv.appendChild(innerDiv);

        if(task.deadline){
            const dateText = document.createElement('small');
            dateText.className = 'date';
            // print deadline - using the format function of Moment.js
            dateText.innerText = task.deadline.format('dddd, MMMM Do YYYY, h:mm:ss a'); 
            // mark expired tasks - using the isBefore function of Moment.js
            const now = moment();
            if(task.deadline.isBefore(now))
                dateText.classList.add('text-danger');
            
            externalDiv.appendChild(dateText);
        }

        const buttonsDiv = document.createElement('div');
        
        const editLink = document.createElement('a');
        editLink.href = `/tasks/${task.id}/edit`;
        const imgEdit = document.createElement('img');
        imgEdit.width = 20;
        imgEdit.height = 20;
        imgEdit.classList = 'img-button mr-1';
        imgEdit.src = '/svg/edit.svg';
        editLink.appendChild(imgEdit);
        buttonsDiv.appendChild(editLink);

        const deleteLink = document.createElement('a');
        deleteLink.href = '#';
        const imgDelete = document.createElement('img');
        imgDelete.width = 20;
        imgDelete.height = 20;
        imgDelete.src = '/svg/delete.svg';
        imgDelete.classList = 'img-button';

        // callback to delete a task
        imgDelete.addEventListener('click', () => {
            this.taskManager.deleteTask(task.id)
            .catch((error) => {
                // add an alert message in DOM
                document.getElementById('error-messages').innerHTML = createAlert('danger', error);
            });
        });
        deleteLink.appendChild(imgDelete);
        buttonsDiv.appendChild(deleteLink);

        externalDiv.appendChild(buttonsDiv);
        
        if(!task.privateTask){
            innerDiv.insertAdjacentHTML('afterend', `<svg class="bi bi-person-square" width="1.2em" height="1.2em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M14 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1zM2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2z" clip-rule="evenodd"/>
                <path fill-rule="evenodd" d="M2 15v-1c0-1 1-4 6-4s6 3 6 4v1H2zm6-6a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
              </svg> `);
        }
            
        li.appendChild(externalDiv);
        return li;
    }

    /**
     * Event listener for the submission of the login form. Handle the login.
     * @param {*} event 
     */
    onLoginSubmitted = async (event) => {
        event.preventDefault();
        const form = event.target;
        const alertMessage = document.getElementById('error-messages');

        if(form.checkValidity()) {
            try {
                const user = await Api.doLogin(form.email.value, form.password.value);
                localStorage.setItem('user', user);
                page.redirect('/');
            } catch(error) {
                console.log(error);
                if (error) {
                    const errorMsg = error;
                    // add an alert message in DOM
                    alertMessage.innerHTML = createAlert('danger', errorMsg);
                    // automatically remove the flash message after 3 sec
                    setTimeout(() => {
                        alertMessage.innerHTML = '';
                    }, 3000);
                }
            }
        }
    }

}

export default App;