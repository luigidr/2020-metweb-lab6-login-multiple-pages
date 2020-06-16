'use strict';

const Task = require('./task');
const db = require('./db');
const moment = require('moment');
const bcrypt = require('bcrypt');

/**
 * Function to create a new Task object from a row of the tasks table
 * @param {*} row a row of the tasks table
 */
const createTask = function (dbTask) {
    const importantTask = (dbTask.important === 1) ? true : false;
    const privateTask = (dbTask['private'] === 1) ? true : false; 
    const completedTask = (dbTask.completed === 1) ? true : false;
    return new Task(dbTask.id, dbTask.description, importantTask, privateTask, moment.utc(dbTask.deadline), dbTask.project, completedTask, dbTask['user_id']);
}

/**
* Function to check if a date is today. Returns true if the date is today, false otherwise.
* @param {*} date a Moment js date to be checked
*/
const isToday = function(date) {
    return date.isSame(moment(), 'day');
}

/**
* Function to check if a date is in the next week. Returns true if the date is in the next week, false otherwise.
* @param {*} date a Moment js Date to be checked
*/
const isNextWeek = function(date) {
    const nextWeek = moment().add(1, 'weeks');
    const tomorrow = moment().add(1, 'days');
    return date.isAfter(tomorrow) && date.isBefore(nextWeek);
}

/**
 * Get tasks and optionally filter them
 */
exports.getTasks = function(filter, userId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM tasks WHERE user_id = ?';
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                let tasks = rows.map((row) => createTask(row));
                if(filter){
                    switch(filter){
                        case 'important':
                            tasks = tasks.filter((el) => {
                                return el.important;
                            });
                            break;
                        case 'private':
                            tasks = tasks.filter((el) => {
                                return el.privateTask;
                            });
                            break;
                        case 'shared':
                            tasks = tasks.filter((el) => {
                                return !el.privateTask;
                            });
                            break;
                        case 'today':
                            tasks = tasks.filter((el) => {
                                if(el.deadline)
                                    return isToday(el.deadline);
                                else
                                    return false;
                            });
                            break;
                        case 'week':
                            tasks = tasks.filter((el) => {
                                if(el.deadline)
                                    return isNextWeek(el.deadline);
                                else
                                    return false;
                            });
                            break;
                        default:
                            //the specified filter is not valid
                            tasks = []
                    }
                }
                resolve(tasks);
            }
        });
    });
}

/**
 * Get a task with given id
 */
exports.getTask = function(id, userId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM tasks WHERE id = ? AND user_id = ?';
        db.get(sql, [id, userId], (err, row) => {
            if (err) 
                reject(err);
            else if (row === undefined)
                resolve({error: 'Course not found.'});
            else {
                const task = createTask(row);
                resolve(task);
            }
        });
    });
}

/**
 * Insert a task in the database and returns the id of the inserted task. 
 * To get the id, this.lastID is used.
 * To use the 'this', db.run uses 'function (err)' instead of an arrow function.
 */
exports.addTask = function(task) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO tasks(description, important, private, project, deadline, completed, user_id) VALUES(?,?,?,?,DATETIME(?),?,?)';
        db.run(sql, [task.description, task.important, task.privateTask, task.project, task.deadline, task.completed, task.userId], function (err) {
            if(err){
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

/**
 * Update an existing task with a given id. newTask contains all the new values of the task (e.g., to mark it as 'completed')
 */
exports.updateTask = function(id, newTask) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE tasks SET description = ?, important = ?, private = ?, project = ?, deadline = DATETIME(?), completed = ? WHERE id = ? AND user_id = ?';
        db.run(sql, [newTask.description, newTask.important, newTask.privateTask, newTask.project, newTask.deadline, newTask.completed, id, newTask.userId], function (err) {
            if(err){
                reject(err);
            } else if (this.changes === 0)
                resolve({error: 'Task not found.'});
            else {
                resolve();
        }
        })
    });
}

/**
 * Delete a task with a given id
 */
exports.deleteTask = function(id, userId) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
        db.run(sql, [id, userId], function(err) {
            if(err)
                reject(err);
            else if (this.changes === 0)
                resolve({error: 'Course not found.'});
            else {
                resolve();
            }
        });
    });
};

exports.getUserById = function(userId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM user WHERE id = ?';
        db.get(sql, [userId], (err, row) => {
            if (err) 
                reject(err);
            else if (row === undefined)
                resolve({error: 'User not found.'});
            else {
                const user = {id: row.id, username: row.email}
                resolve(user);
            }
        });
    });
}

exports.getUser = function(email, password) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM user WHERE email = ?';
        db.get(sql, [email], (err, row) => {
            if (err) 
                reject(err);
            else if (row === undefined)
                resolve({error: 'User not found.'});
            else {
                const user = {id: row.id, username: row.email};
                let check = false;
                
                if(bcrypt.compareSync(password, row.password))
                check = true;

                resolve({user, check});
            }
        });
    });
}
