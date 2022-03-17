// establish dependancies
const logo = require("asciiart-logo");
const express = require("express");
const inquirer = require("inquirer");
const mysql2 = require("mysql2");
const ct = require("console.table");

const PORT = process.env.PORT || 3001;
const app = express();

// express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// connecting to the database
const db = mysql2.createConnection(
	{
		host: "localhost",
		user: "root",
		password: "loki",
		database: "employee_db",
	},
	console.log(`Connected to the employee database.`)
);

// application initiation questions
function menuPrompt() {
	// initial prompts for user to chose on app run
	inquirer
		.prompt({
			type: "list",
			message: "What would you like to do?",
			name: "choice",
			choices: [
				"VIEW All Employees",
				"VIEW All Roles",
				"VIEW All Departments",
				"ADD Employee",
				"ADD Role",
				"ADD Department",
				"UPDATE Employee",
			],
		})
		.then(function (val) {
			switch (val.choice) {
				case "VIEW All Employees":
					viewEEs();
					console.log("VIEW All Employees");
					break;

				case "VIEW All Roles":
					viewRoles();
					console.log("VIEW All Roles");
					break;

				case "VIEW All Departments":
					viewDepts();
					console.log("VIEW All Departments");
					break;

				case "ADD Employee":
					addEE();
					console.log("ADD Employee");
					break;

				case "UPDATE Employee":
					// updateEE();
					console.log("UPDATE Employee");
					break;

				case "ADD Role":
					addRole();
					console.log("ADD Role");
					break;

				case "ADD Department":
					addDept();
					console.log("ADD Department");
					break;
			}
		});
}

// funtion to display all EEs in a table format and print menu again
function viewEEs() {
	db.query(
		"SELECT employee.first_name, employee.last_name, ee_role.title, ee_role.salary, department.department_name, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN ee_role on ee_role.id = employee.role_id INNER JOIN department on department.id = ee_role.department_id left join employee e on employee.manager_id = e.id;",
		function (err, res) {
			if (err) throw err;
			console.table(res);
			menuPrompt();
		}
	);
}

// funtion to display all organization Roles in a table format and print menu again
function viewRoles() {
	db.query(
		"SELECT ee_role.title, ee_role.id, department.department_name, ee_role.salary FROM ee_role INNER JOIN department on department.id = ee_role.department_id",
		function (err, res) {
			if (err) throw err;
			console.table(res);
			menuPrompt();
		}
	);
}

// funtion to display all organization Departments in a table format and print menu again
function viewDepts() {
	db.query(
		"SELECT department.department_name, department.id FROM department",
		function (err, res) {
			if (err) throw err;
			console.table(res);
			menuPrompt();
		}
	);
}

function addEE() {
	inquirer
		.prompt([
			{
				name: "firstName",
				type: "input",
				message: "Enter employee's first name ",
			},
			{
				name: "lastName",
				type: "input",
				message: "Enter employee's last name ",
			},
			{
				name: "role",
				type: "input",
				message: "What is the employee's role? ",
				default: 2,
			},
			{
				name: "manager",
				type: "input",
				message: "What is the employee's manager ID?",
				default: 1,
			},
		])
		.then((answer) => {
			db.query(
				`INSERT INTO employee VALUES (default,
				"${answer.firstName}",
				"${answer.lastName}",
				"${answer.role}",
				"${answer.manager}")`
			);
			console.log(`Employee ${answer.firstName} ${answer.lastName} added`);
			menuPrompt();
		});
}

function addRole() {
	inquirer
		.prompt([
			{
				name: "newRole",
				type: "input",
				message: "Enter the role title you'd like to add",
			},
			{
				name: "roleSalary",
				type: "input",
				message: "Enter the salary for this role",
			},
			{
				name: "roleDept",
				type: "input",
				message: "Enter the department ID for this role.",
			},
		])
		.then((answer) => {
			db.query(
				`INSERT INTO ee_role VALUES (default,
				"${answer.newRole}",
				"${answer.roleSalary}",
				"${answer.roleDept}")`,
				(err, res) => {
					console.log(`${answer.newRole} role added`);
					console.log(err);
					menuPrompt();
				}
			);
		});
}

function addDept() {
	inquirer
		.prompt([
			{
				name: "newDept",
				type: "input",
				message: "Enter the name of the new department?",
			},
		])
		.then((answer) => {
			db.query(
				`INSERT INTO department VALUES (default, "${answer.newDept}");`,
				(err, res) => {
					console.log(`${answer.newDept} department added`);
					console.log(err);
					menuPrompt();
				}
			);
		});
}

// logo writer
function renderProjectLogo() {
	const config = require("./package.json");
	console.log(logo(config).render());
}

function init() {
	renderProjectLogo();
	menuPrompt();
}

init();

// creating port listen
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
